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
import TextOverCharacterDrawer from "../ui/TextOverCharacterDrawer";
import LoggerFactory from "@/logger/LoggerFactory";
import AbilityService from "./ability/AbilityService";
import PlayerService from "../PlayerService";
import MonsterEvolutionService from "../monster/monster-evolution/MonsterEvolutionService";
import GameAppDataLoader from "../GameAppDataLoader";
import MonsterIndexService from "../monster/MonsterIndexService";
import RendererService from "@/services/RendererService";
import GameApp from "../GameApp";

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
  protected monsterEvolutionService = Container.get<MonsterEvolutionService>(
    MonsterEvolutionService
  );
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected gameAppDataLoader =
    Container.get<GameAppDataLoader>(GameAppDataLoader);
  protected rendererService = Container.get<RendererService>(RendererService);
  protected gameApp = Container.get<GameApp>(GameApp);

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

    const promise1 = this.applyEffects(effects, this.source);
    const promise2 = this.applyEffects(effects, this.target);
    const totalExp = await Promise.all([promise1, promise2]);
    await abilityName;

    const exp = totalExp.reduce((prev, curr) => prev + curr, 0);

    await this.gainExp(this.source, exp);
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

    this.statsService.updateMonsterAttributes(
      monster,
      false,
      monster.statsAlterations
    );

    const toHP = monster.stats.hp;

    const healthUpdater = new HealthBarUpdateDrawer(monster, fromHP, toHP);
    this.gameLoop.addGameLoopHandler(healthUpdater);
    await healthUpdater.notifyWhenCompleted();

    if (this.battleService.isDead(monster.uuid)) {
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
  protected async gainExp(monster: Monster, exp: number): Promise<void> {
    const levelUp = this.levelUpService.canLevelUp(monster, exp);
    await this.levelUpService.gainExperience(monster, exp);
    if (!levelUp) {
      return;
    }
    this.logger.debug(`Show level up for ${monster.uuid}`);
    const drawer = new TextOverCharacterDrawer(monster, "LEVEL UP!");
    this.gameLoop.addGameLoopHandler(drawer);
    await drawer.notifyWhenCompleted();

    const newAbilities = this.abilityService.getNewLearnableAbilities(monster);
    if (newAbilities.length > 0) {
      if (monster.ownerId === this.playerService.getPlayerId()) {
        this.logger.debug(
          `A monster owned by the player (${monster.uuid}) learned new abilities, show message`
        );
        for (const newAbility of newAbilities) {
          const ability = this.abilityService.getAbility(newAbility.abilityId);
          const newAbilityMessage = new AbilityNameDrawer(ability.label);
          this.gameLoop.addGameLoopHandler(newAbilityMessage);
          await newAbilityMessage.notifyWhenCompleted();
        }
      }
      for (const newAbility of newAbilities) {
        this.abilityService.learnAbility(monster, newAbility.abilityId);
      }
    }
    await this.evolve(monster);
  }

  protected async evolve(monster: Monster): Promise<void> {
    if (monster.ownerId !== this.playerService.getPlayerId()) {
      return;
    }
    if (!this.monsterEvolutionService.canEvolve(monster)) {
      return;
    }
    const evolutions =
      this.monsterEvolutionService.getAvailableEvolutions(monster);
    this.logger.info(`Monster ${monster.uuid} can evolve.`);
    // TODO allow the user to select which evolution
    const target = evolutions[0];
    const newIndex = this.monsterIndexService.getMonster(target.evolutionId);

    const evolutionName = new AbilityNameDrawer(
      `${monster.name} evolves in ${newIndex.name}`
    );
    this.gameLoop.addGameLoopHandler(evolutionName);
    await evolutionName.notifyWhenCompleted();

    await this.gameAppDataLoader.loadMonstersSpriteSheets([newIndex]);
    this.monsterEvolutionService.evolve(monster, evolutions[0]);

    // replace sprites
    const battleContainer = this.gameApp.getBattleContainer();
    const oldContainer = battleContainer.getChildByName(monster.uuid);
    const newContainer = this.rendererService.createMonsterContainer(
      monster,
      newIndex,
      "normal"
    );

    // track new sprite
    const handler = this.gameLoop.getMonsterAnimationDrawer();
    handler.removeMonster(monster.uuid);
    handler.addMonster(
      monster.uuid,
      this.monsterIndexService.getMonster(monster.modelId),
      this.rendererService.getMonsterSprite(newContainer),
      "normal"
    );
    battleContainer.removeChild(oldContainer);
    battleContainer.addChild(newContainer);
  }
}
