import Monster from "@/game-engine/model/monster/Monster";
import Container from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import BattleService from "@/game-engine/battle/BattleService";
import GameLoop from "@/game-engine/GameLoop";
import HistoryRepository from "@/game-engine/battle/turns/HistoryRepository";
import AbilityService from "@/game-engine/ability/AbilityService";
import PlayerService from "@/game-engine/PlayerService";
import Ability from "@/game-engine/model/ability/Ability";
import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import ChangeFocusDrawer from "@/game-engine/ui/ChangeFocusDrawer";
import AbilityNameDrawer from "@/game-engine/ui/AbilityNameDrawer";
import FormulaService from "@/game-engine/FormulaService";
import MapRepository from "@/game-engine/map/MapRepository";

export default class AbilityExecutor {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.AbilityExecutor");
  protected battleService = Container.get(BattleService);
  protected gameLoop = Container.get(GameLoop);
  protected historyRepository = Container.get(HistoryRepository);
  protected abilityService = Container.get(AbilityService);
  protected playerService = Container.get(PlayerService);
  protected formulaService = Container.get(FormulaService);
  protected mapRepository = Container.get(MapRepository);

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

    if (this.ability.concentration) {
      this.logger.info(`Ability has concentration, remove effects`);
      this.applyConcentration();
    }
    const effects = await this.ability
      .getProcessor()
      .execute(this.source, this.target, this.ability);
    this.logger.debug(`Ability effects `, effects);

    await this.focusTarget();
    const abilityName = this.showAbilityName();
    const exp = await this.processEffects(effects);
    await abilityName;

    const allies = this.mapRepository.getAllies(this.source);
    await this.battleService.gainExp(allies, exp);
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
      const exp = this.formulaService.getKillExperience(this.target);
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

  protected applyConcentration(): void {
    const monsters = this.mapRepository.getMap().monsters;
    monsters.forEach((m) => {
      m.activeEffects = m.activeEffects.filter((e) => {
        const sameSource = e.sourceId === this.source.uuid;
        const concentration = this.usesConcentration(e.abilityId);
        const toBeRemoved = sameSource && concentration;
        this.logger.info(
          `Active effect on ${m.uuid} applied with concentration from ${this.source.uuid}, remove.`
        );
        return toBeRemoved;
      });
    });
  }

  protected usesConcentration(abilityId: string): boolean {
    const ability = this.abilityService.getAbility(abilityId);
    return ability.concentration;
  }
}
