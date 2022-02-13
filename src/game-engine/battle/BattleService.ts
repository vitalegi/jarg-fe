import * as PIXI from "pixi.js";
import Monster from "@/game-engine/model/monster/Monster";
import Container, { Service } from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import RendererService from "@/services/RendererService";
import GameApp from "@/game-engine/GameApp";
import TurnManager from "@/game-engine/battle/turns/TurnManager";
import PlayerService from "@/game-engine/PlayerService";
import GameLoop from "@/game-engine/GameLoop";
import MonsterActionMenuBuilder from "@/game-engine/ui/MonsterActionMenuBuilder";
import MapRepository from "@/game-engine/map/MapRepository";
import PhaseService from "@/game-engine/game-phase/PhaseService";
import StatusService from "@/game-engine/monster/status/StatusService";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import GameAppDataLoader from "@/game-engine/GameAppDataLoader";
import AbilityService from "@/game-engine/ability/AbilityService";
import MonsterEvolutionService from "@/game-engine/monster/MonsterEvolutionService";
import HealthBarService from "@/game-engine/monster/HealthBarService";
import StatsService from "@/game-engine/monster/stats/StatsService";
import ChangeFocusDrawer from "@/game-engine/ui/ChangeFocusDrawer";
import GameConfig from "@/game-engine/GameConfig";
import MonsterAI from "@/game-engine/ai/MonsterAI";
import TextOverCharacterDrawer from "@/game-engine/ui/TextOverCharacterDrawer";
import AbilityNameDrawer from "@/game-engine/ui/AbilityNameDrawer";
import HealthBarUpdateDrawer from "@/game-engine/ui/HealthBarUpdateDrawer";

@Service()
export default class BattleService {
  logger = LoggerFactory.getLogger("GameEngine.Battle.BattleService");

  protected gameApp = Container.get<GameApp>(GameApp);
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected playerService = Container.get<PlayerService>(PlayerService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected monsterActionMenuBuilder = Container.get<MonsterActionMenuBuilder>(
    MonsterActionMenuBuilder
  );
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected phaseService = Container.get<PhaseService>(PhaseService);
  protected statusService = Container.get<StatusService>(StatusService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected gameAppDataLoader =
    Container.get<GameAppDataLoader>(GameAppDataLoader);
  protected abilityService = Container.get<AbilityService>(AbilityService);
  protected monsterEvolutionService = Container.get<MonsterEvolutionService>(
    MonsterEvolutionService
  );
  protected rendererService = Container.get<RendererService>(RendererService);
  protected healthBarService =
    Container.get<HealthBarService>(HealthBarService);
  protected statsService = Container.get<StatsService>(StatsService);

  public async startCharacterTurn(): Promise<void> {
    if (!this.turnManager.hasCharacters()) {
      this.logger.info("No active users, do nothing");
      return;
    }
    const active = this.turnManager.activeCharacter();
    if (!active) {
      return;
    }
    const monster = active.monster;
    const playerId = this.playerService.getPlayerId();
    this.logger.debug(`Focus on ${monster.coordinates}`);
    if (monster.coordinates) {
      const focus = new ChangeFocusDrawer(monster.coordinates);
      this.gameLoop.addGameLoopHandler(focus);
      await focus.notifyWhenCompleted();
    }
    // refresh active effects
    monster.activeEffects = monster.activeEffects.filter((e) => {
      e.duration.nextTurn();
      const completed = e.duration.isCompleted();
      if (completed) {
        this.logger.debug(
          `Monster ${monster.name} (${monster.uuid}) active effect ${e.type} is completed, remove it`
        );
      } else {
        this.logger.debug(
          `Monster ${monster.name} (${monster.uuid}) active effect ${e.type} is still active`
        );
      }
      return !completed;
    });
    // applied effects consider the current status of the monster, without expired effects
    this.statsService.updateMonsterAttributes(monster, false);

    for (const e of monster.activeEffects) {
      await e.turnStartBefore();
    }
    for (const e of monster.activeEffects) {
      await e.turnStartRender();
    }
    for (const e of monster.activeEffects) {
      await e.turnStartAfter();
    }
    // refresh monster stat
    this.statsService.updateMonsterAttributes(monster, false);
    await this.applyStatusEffects(monster);

    if (monster.isDead()) {
      this.logger.info(
        `Monster died due to bad status effects, go to next turn`
      );
      this.nextTurn();
      return;
    }

    if (playerId === monster.ownerId) {
      await this.startPlayerTurn(monster);
    } else {
      await this.startNpcTurn(monster);
    }
  }

  protected async startPlayerTurn(monster: Monster): Promise<void> {
    this.logger.info(`Monster ${monster.uuid} is owned by player, show menu`);

    this.monsterActionMenuBuilder.build(monster).draw();

    const container = this.gameApp
      .getBattleContainer()
      .getChildByName(monster.uuid);
    if (container) {
      const c = container as PIXI.Container;

      const background = new PIXI.Graphics();
      background.lineStyle({ width: 2, color: 0xff0000, alpha: 0.9 });

      const width = GameConfig.SHARED.tile.width;
      const height = GameConfig.SHARED.tile.height;
      background.drawEllipse(width / 2, height - 12, width / 4, 4);
      background.endFill();
      background.name = "activeCharacter";

      c.addChildAt(background, 0);
    }
  }

  protected async startNpcTurn(monster: Monster): Promise<void> {
    this.logger.info(
      `Monster ${monster.uuid} is managed by AI, perform action`
    );
    const ai = new MonsterAI(monster);
    await ai.execute();
    this.logger.debug(`Monster action is completed, go to next.`);
    this.nextTurn();
  }

  public nextTurn(): void {
    const activeCharacter = this.turnManager.activeCharacter();
    if (activeCharacter) {
      const container = this.gameApp
        .getBattleContainer()
        .getChildByName(activeCharacter.monster.uuid);
      if (container) {
        const c = container as PIXI.Container;
        const element = c.getChildByName("activeCharacter");
        c.removeChild(element);
      }
    }

    this.turnManager.next();

    if (this.isBattleOver()) {
      this.completeBattle();
    } else {
      // async action, completion is not monitored
      this.startCharacterTurn();
    }
  }

  public isBattleOver(): boolean {
    if (this.isGameOver(this.playerService.getPlayerId())) {
      return true;
    }
    if (this.isGameWin(this.playerService.getPlayerId())) {
      return true;
    }
    return false;
  }

  public completeBattle(): void {
    if (this.isGameOver(this.playerService.getPlayerId())) {
      if (this.mapRepository.onLoss) {
        this.mapRepository.onLoss();
      }
      return;
    }
    if (this.isGameWin(this.playerService.getPlayerId())) {
      if (this.mapRepository.onWin) {
        this.mapRepository.onWin();
      }
      return;
    }
    this.logger.error(
      `Battle is not completed, you should not reach this point.`
    );
  }

  public isGameOver(playerId: string): boolean {
    return (
      this.getMonstersInBattle().filter((m) => m.ownerId === playerId)
        .length === 0
    );
  }

  public isGameWin(playerId: string): boolean {
    return (
      this.getMonstersInBattle().filter((m) => m.ownerId !== playerId)
        .length === 0
    );
  }

  public getMonstersInBattle(): Monster[] {
    return this.mapRepository.getMap().monsters;
  }

  public async die(uuid: string): Promise<void> {
    this.logger.info(`Monster ${uuid} died.`);
    this.removeMonster(uuid);
  }

  public async removeMonster(uuid: string): Promise<void> {
    const monster = this.mapRepository.getMonsterById(uuid);

    const container = this.gameApp
      .getBattleContainer()
      .getChildByName(monster.uuid);

    this.gameLoop.getMonsterAnimationDrawer().removeMonster(monster.uuid);

    this.gameApp.getBattleContainer().removeChild(container);

    this.mapRepository.getMap().monsters = this.mapRepository
      .getMap()
      .monsters.filter((m) => m.uuid !== monster.uuid);
    this.turnManager.removeCharacter(uuid);
  }

  public async gainExp(monster: Monster, exp: number): Promise<void> {
    const allies = this.mapRepository.getAllies(monster);
    if (allies.length === 1) {
      await this.gainExpMonster(monster, exp);
    } else {
      const uniqueExp = Math.ceil(exp / 2);
      const spreadedToOthers = exp - uniqueExp;
      const spreadedExpPerMonster = Math.ceil(spreadedToOthers / allies.length);

      const gainExp: Promise<void>[] = [];
      gainExp.push(
        this.gainExpMonster(monster, uniqueExp + spreadedExpPerMonster)
      );
      for (const ally of allies) {
        if (ally.uuid !== monster.uuid) {
          gainExp.push(this.gainExpMonster(ally, spreadedExpPerMonster));
        }
      }
      await Promise.all(gainExp);
    }
  }

  public async gainExpMonster(monster: Monster, exp: number): Promise<void> {
    if (exp <= 0.0001) {
      return;
    }
    const levelUp = this.levelUpService.canLevelUp(monster, exp);
    await this.levelUpService.gainExperience(monster, exp);
    if (!levelUp) {
      return;
    }
    this.logger.debug(`Show level up for ${monster.uuid}`);
    const drawer = new TextOverCharacterDrawer(monster, "LEVEL UP!");
    this.gameLoop.addGameLoopHandler(drawer);
    await drawer.notifyWhenCompleted();

    // refresh health bar
    const monsterContainer = this.gameApp
      .getBattleContainer()
      .getChildByName(monster.uuid) as PIXI.Container;
    this.healthBarService.updateBar(
      monsterContainer,
      monster,
      monster.stats.hp
    );

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

  public async evolve(monster: Monster): Promise<void> {
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

  protected async applyStatusEffects(monster: Monster): Promise<void> {
    const damage = this.statusService.getDamage(monster);
    const fromHP = monster.stats.hp;
    const toHP = monster.stats.hp - damage;
    await HealthBarUpdateDrawer.changeHealth(monster, fromHP, toHP);
    monster.stats.hp = toHP;

    if (monster.isDead()) {
      const totalExp = this.levelUpService.getKillExperience(monster);
      await this.die(monster.uuid);
      const monsters = this.mapRepository
        .getMap()
        .monsters.filter((m) => m.ownerId !== monster.ownerId);

      if (monsters.length === 0) {
        this.logger.info(`No enemies alive, EXP is lost.`);
        return;
      }
      this.logger.info(
        `Monster died due to altered status. EXP is shared with all enemies: ${monsters
          .map((m) => `${m.name} (${m.uuid})`)
          .join(", ")}`
      );
      const exp = Math.ceil(totalExp / monsters.length);
      for (const m of monsters) {
        await this.gainExpMonster(m, exp);
      }
    }
  }
}
