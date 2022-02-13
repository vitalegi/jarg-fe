import Monster from "@/game-engine/monster/Monster";
import Container from "typedi";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import LoggerFactory from "@/logger/LoggerFactory";
import BattleService from "@/game-engine/battle/BattleService";
import GameLoop from "@/game-engine/GameLoop";
import HistoryRepository from "@/game-engine/battle/turns/HistoryRepository";
import AbilityService from "@/game-engine/ability/model/AbilityService";
import PlayerService from "@/game-engine/PlayerService";
import Ability from "@/game-engine/model/ability/Ability";
import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import ChangeFocusDrawer from "@/game-engine/ui/ChangeFocusDrawer";
import AbilityNameDrawer from "@/game-engine/ui/AbilityNameDrawer";

export default class AbilityExecutor {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.AbilityExecutor");
  protected battleService = Container.get<BattleService>(BattleService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected historyRepository =
    Container.get<HistoryRepository>(HistoryRepository);
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
    this.historyRepository.usesAbility(this.ability);
    const effects = await this.ability
      .getProcessor()
      .execute(this.source, this.target, this.ability);
    this.logger.debug(`Ability effects `, effects);

    await this.focusTarget();
    const abilityName = this.showAbilityName();
    const exp = await this.processEffects(effects);
    await abilityName;

    await this.battleService.gainExp(this.source, exp);
    this.logger.info("AbilityExecutor - END");
  }

  protected async processEffects(effects: ComputedEffect[]): Promise<number> {
    for (let i = 0; i < effects.length; i++) {
      await effects[i].onHitBefore();
    }
    for (let i = 0; i < effects.length; i++) {
      await effects[i].onHitRender();
    }
    for (let i = 0; i < effects.length; i++) {
      await effects[i].onHitAfter();
    }
    if (this.target.isDead()) {
      const exp = this.levelUpService.getKillExperience(this.target);
      await this.battleService.die(this.target.uuid);
      // if you killed an ally, you don't earn any exp.
      if (this.source.ownerId !== this.target.ownerId) {
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
