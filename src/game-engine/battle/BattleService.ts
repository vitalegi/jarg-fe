import * as PIXI from "pixi.js";
import Monster from "@/game-engine/monster/Monster";
import Container, { Service } from "typedi";
import GameApp from "../GameApp";
import GameLoop from "../GameLoop";
import MonsterActionMenuBuilder from "../monster-action/ui/MonsterActionMenuBuilder";
import PlayerService from "../PlayerService";
import ChangeFocusDrawer from "../ui/ChangeFocusDrawer";
import TurnManager from "./TurnManager";
import MapRepository from "../map/MapRepository";
import MonsterAI from "../monster-action/ai/MonsterAI";
import GameConfig from "../GameConfig";
import SelectNextBattlePhase from "../game-phase/SelectNextBattlePhase";
import LoggerFactory from "@/logger/LoggerFactory";
import StatusService from "../monster/status/StatusService";
import HealthBarUpdateDrawer from "../ui/HealthBarUpdateDrawer";
import { LevelUpService } from "../monster/LevelUpService";
import TextOverCharacterDrawer from "../ui/TextOverCharacterDrawer";
import MonsterIndexService from "../monster/MonsterIndexService";
import GameAppDataLoader from "../GameAppDataLoader";
import AbilityService from "../monster-action/ability/AbilityService";
import AbilityNameDrawer from "../ui/AbilityNameDrawer";
import MonsterEvolutionService from "../monster/monster-evolution/MonsterEvolutionService";
import RendererService from "@/services/RendererService";
import HealthBarService from "../monster/HealthBarService";
import PhaseService from "../game-phase/PhaseService";

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
    this.logger.info(`Focus on ${monster.coordinates}`);
    if (monster.coordinates) {
      const focus = new ChangeFocusDrawer(monster.coordinates);
      this.gameLoop.addGameLoopHandler(focus);
      await focus.notifyWhenCompleted();
    }
    await this.applyStatusEffects(monster);
    if (this.isDead(monster)) {
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
    this.logger.info(`Monster action is completed, go to next.`);
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
      this.logger.info(`Player is defeated, end.`);
      this.phaseService.goToGameOver();
      return;
    }
    if (this.isGameWin(this.playerService.getPlayerId())) {
      this.logger.info("Player wins");
      Container.get<SelectNextBattlePhase>(SelectNextBattlePhase).start();
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

  public isDead(monster: Monster): boolean {
    return monster.stats.hp <= 0;
  }

  public async die(uuid: string): Promise<void> {
    const monster = this.mapRepository.getMonsterById(uuid);

    this.logger.info(`Monster ${monster.uuid} died.`);

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

  public async changeHealth(
    monster: Monster,
    fromHP: number,
    toHP: number
  ): Promise<void> {
    const healthUpdater = new HealthBarUpdateDrawer(monster, fromHP, toHP);
    this.gameLoop.addGameLoopHandler(healthUpdater);
    await healthUpdater.notifyWhenCompleted();
  }

  public async gainExp(monster: Monster, exp: number): Promise<void> {
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
    await this.changeHealth(monster, fromHP, toHP);
    monster.stats.hp = toHP;

    if (this.isDead(monster)) {
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
        await this.gainExp(m, exp);
      }
    }
  }
}
