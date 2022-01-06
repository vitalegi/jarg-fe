import Monster from "@/game-engine/monster/Monster";
import Container from "typedi";
import AbilityNameDrawer from "../ui/AbilityNameDrawer";
import Ability from "./Ability";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import HealthBarService from "../monster/HealthBarService";
import TextOverCharacter from "../ui/TextOverCharacterDrawer";
import Effect from "./effects/Effect";
import HealthBarUpdateDrawer from "../ui/HealthBarUpdateDrawer";
import ChangeFocusDrawer from "../ui/ChangeFocusDrawer";
import GameLoop from "../GameLoop";
import TurnManager from "../battle/TurnManager";
import BattleService from "../battle/BattleService";
import SingleTargetAbility from "./SingleTargetAbility";

export default class AbilityExecutor {
  protected battleService = Container.get<BattleService>(BattleService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected healthBarService =
    Container.get<HealthBarService>(HealthBarService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected turnManager = Container.get<TurnManager>(TurnManager);

  protected source: Monster;
  protected target: Monster;
  protected ability: Ability;

  public constructor(source: Monster, target: Monster, ability: Ability) {
    this.source = source;
    this.target = target;
    this.ability = ability;
  }

  public async execute(): Promise<void> {
    this.ability.usages.current--;

    const activeCharacter = this.turnManager.activeCharacter();
    if (activeCharacter) {
      activeCharacter.usesAbility(this.ability);
    }

    const processor = this.ability.getProcessor(this.source, this.target);

    const hits = processor.hit();
    await this.focusTarget();
    const abilityName = this.showAbilityName();
    if (hits) {
      const effects = processor.execute();
      const promise1 = this.applyEffects(effects, abilityName, this.source);
      const promise2 = this.applyEffects(effects, abilityName, this.target);
      const totalExp = await Promise.all([promise1, promise2]);
      const exp = totalExp.reduce((prev, curr) => prev + curr, 0);
      // if you killed an ally, you don't earn any exp.
      await this.levelUpService.gainExperience(this.source, exp);
    } else {
      console.log("Miss");
      const effectsDrawer = this.showMiss();
      await this.waitCompletion([abilityName, effectsDrawer]);
    }
  }

  protected async applyEffects(
    effects: Effect[],
    abilityName: Promise<void>,
    monster: Monster
  ): Promise<number> {
    effects = this.getEffectsOnMonster(effects, monster);
    const effectsDrawer = this.showAbilityEffects(monster, effects);
    await this.waitCompletion([abilityName, effectsDrawer]);
    if (effects.length === 0) {
      return 0;
    }
    const fromHP = monster.stats.hp;
    effects.forEach((effect) => effect.apply(monster));
    const toHP = monster.stats.hp;

    console.log(
      `Target: ${monster.uuid}, action: ${
        this.ability.label
      }, effects: ${JSON.stringify(effects)}. HP of ${monster.uuid}: ${
        monster.stats.hp
      }/${monster.stats.maxHP}`
    );
    const healthUpdater = new HealthBarUpdateDrawer(monster, fromHP, toHP);
    this.gameLoop.addGameLoopHandler(healthUpdater);
    await healthUpdater.notifyWhenCompleted();

    if (this.battleService.isDead(monster.uuid)) {
      const exp = this.levelUpService.getKillExperience(monster);
      await this.battleService.die(monster.uuid);
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
    console.log(`show ability name ${this.ability.label}`);
    const ability = new AbilityNameDrawer(this.ability.label);
    this.gameLoop.addGameLoopHandler(ability);
    return ability.notifyWhenCompleted();
  }

  protected async showAbilityEffects(
    monster: Monster,
    effects: Effect[]
  ): Promise<void> {
    if (effects.length === 0) {
      return;
    }
    const msg = effects.map((e) => e.textualEffect(this.target)).join("\n");
    const drawer = new TextOverCharacter(monster, msg);
    this.gameLoop.addGameLoopHandler(drawer);
    return drawer.notifyWhenCompleted();
  }

  protected showMiss(): Promise<void> {
    const drawer = TextOverCharacter.miss(this.target);
    this.gameLoop.addGameLoopHandler(drawer);
    return drawer.notifyWhenCompleted();
  }

  protected async waitCompletion(promises: Promise<void>[]): Promise<void> {
    await Promise.all(promises);
  }

  protected getEffectsOnMonster(effects: Effect[], monster: Monster): Effect[] {
    return effects.filter(
      (effect) =>
        effect.target.getTarget(this.source, this.target).uuid === monster.uuid
    );
  }
}
