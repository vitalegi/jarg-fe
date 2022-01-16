import Monster from "@/game-engine/monster/Monster";
import Container from "typedi";
import AbilityNameDrawer from "../ui/AbilityNameDrawer";
import Ability from "./ability/Ability";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import HealthBarService from "../monster/HealthBarService";
import HealthBarUpdateDrawer from "../ui/HealthBarUpdateDrawer";
import ChangeFocusDrawer from "../ui/ChangeFocusDrawer";
import GameLoop from "../GameLoop";
import TurnManager from "../battle/TurnManager";
import BattleService from "../battle/BattleService";
import ComputedEffect from "./computed-effect/ComputedEffect";
import StatsService from "../monster/stats/StatsService";
import LoggerFactory from "@/logger/LoggerFactory";
import AbilityService from "./ability/AbilityService";
import PlayerService from "../PlayerService";

export default class AbilityExecutor {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.AbilityExecutor");
  protected battleService = Container.get<BattleService>(BattleService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected healthBarService =
    Container.get<HealthBarService>(HealthBarService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected statsService = Container.get<StatsService>(StatsService);
  protected abilityService = Container.get<AbilityService>(AbilityService);
  protected playerService = Container.get<PlayerService>(PlayerService);

  protected source: Monster;
  protected target: Monster;
  protected ability: Ability;

  public constructor(source: Monster, target: Monster, ability: Ability) {
    this.source = source;
    this.target = target;
    this.ability = ability;
  }

  public async execute(): Promise<void> {
    const ability = this.source.abilities.filter(
      (a) => a.abilityId === this.ability.id
    )[0];
    ability.currentUsages--;
    this.logger.info(
      `AbilityExecutor - START ability=${this.ability.id}/${this.ability.label}`
    );
    const activeCharacter = this.turnManager.activeCharacter();
    if (activeCharacter) {
      activeCharacter.usesAbility(this.ability);
    }
    const effects = await this.ability
      .getProcessor()
      .execute(this.source, this.target, this.ability);
    this.logger.debug(`Ability effects `, effects);

    await this.focusTarget();
    const abilityName = this.showAbilityName();

    const promises: Promise<number>[] = [];
    promises.push(this.applyEffects(effects, this.source));
    if (this.source.uuid !== this.target.uuid) {
      promises.push(this.applyEffects(effects, this.target));
    }
    const totalExp = await Promise.all(promises);
    await abilityName;

    const exp = totalExp.reduce((prev, curr) => prev + curr, 0);

    await this.battleService.gainExp(this.source, exp);
    this.logger.info("AbilityExecutor - END");
  }

  protected async applyEffects(
    effects: ComputedEffect[],
    monster: Monster
  ): Promise<number> {
    effects = this.getEffectsOnMonster(effects, monster);

    const fromHP = monster.stats.hp;
    effects.forEach((e) => e.applyBeforeRender());

    for (let i = 0; i < effects.length; i++) {
      await effects[i].render();
    }

    effects.forEach((e) => e.applyAfterRender());

    this.statsService.updateMonsterAttributes(monster, false);

    const toHP = monster.stats.hp;
    await this.battleService.changeHealth(monster, fromHP, toHP);

    if (this.battleService.isDead(monster)) {
      const exp = this.levelUpService.getKillExperience(monster);
      await this.battleService.die(monster.uuid);
      // if you killed an ally, you don't earn any exp.
      if (this.source.ownerId !== monster.ownerId) {
        return exp;
      }
    }
    return 0;
  }

  protected focusTarget(): Promise<void> {
    if (this.target.coordinates) {
      const focus = new ChangeFocusDrawer(this.target.coordinates);
      this.gameLoop.addGameLoopHandler(focus);
      return focus.notifyWhenCompleted();
    }
    return Promise.resolve();
  }

  protected async showAbilityName(): Promise<void> {
    const ability = new AbilityNameDrawer(this.ability.label);
    this.gameLoop.addGameLoopHandler(ability);
    return ability.notifyWhenCompleted();
  }

  protected async waitCompletion(promises: Promise<void>[]): Promise<void> {
    await Promise.all(promises);
  }

  protected getEffectsOnMonster(
    effects: ComputedEffect[],
    monster: Monster
  ): ComputedEffect[] {
    return effects.filter((effect) => effect.hasEffectOn(monster));
  }
}
