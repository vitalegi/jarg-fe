import * as PIXI from "pixi.js";
import Monster from "@/game-engine/model/monster/Monster";
import Container, { Service } from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import GameApp from "@/game-engine/GameApp";
import TurnManager from "@/game-engine/battle/turns/TurnManager";
import PlayerService from "@/game-engine/PlayerService";
import GameLoop from "@/game-engine/GameLoop";
import MonsterActionMenuBuilder from "@/game-engine/ui/MonsterActionMenuBuilder";
import MapRepository from "@/game-engine/map/MapRepository";
import StatusService from "@/game-engine/monster/status/StatusService";
import StatsService from "@/game-engine/monster/stats/StatsService";
import ChangeFocusDrawer from "@/game-engine/ui/ChangeFocusDrawer";
import GameConfig from "@/game-engine/GameConfig";
import MonsterAI from "@/game-engine/ai/MonsterAI";
import HealthBarUpdateDrawer from "@/game-engine/ui/HealthBarUpdateDrawer";
import FormulaService from "@/game-engine/FormulaService";
import GainExpFlow from "@/game-engine/battle/GainExpFlow";

@Service()
export default class BattleService {
  logger = LoggerFactory.getLogger("GameEngine.Battle.BattleService");

  private gameApp = Container.get(GameApp);
  private turnManager = Container.get(TurnManager);
  private playerService = Container.get(PlayerService);
  private gameLoop = Container.get(GameLoop);
  private monsterActionMenuBuilder = Container.get(MonsterActionMenuBuilder);
  private mapRepository = Container.get(MapRepository);
  private statusService = Container.get(StatusService);
  private statsService = Container.get(StatsService);
  private formulaService = Container.get(FormulaService);
  private gainExpFlow = Container.get(GainExpFlow);

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
      const enemies = this.mapRepository.getEnemies(monster);
      const exp = this.formulaService.getKillExperience(monster);
      await this.gainExp(enemies, exp);
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

  private getMonstersInBattle(): Monster[] {
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

  public async gainExp(monsters: Monster[], exp: number): Promise<void> {
    if (monsters.length === 0) {
      return;
    }
    const expPerUnit = Math.ceil(exp / monsters.length);
    const monstersExp = monsters.map((m) => {
      return { monster: m, exp: expPerUnit };
    });
    await Promise.all(
      monstersExp.map((m) => this.gainExpFlow.gainExpMonster(m.monster, m.exp))
    );
  }

  protected async applyStatusEffects(monster: Monster): Promise<void> {
    const damage = this.statusService.getDamage(monster);
    const fromHP = monster.stats.hp;
    const toHP = monster.stats.hp - damage;
    await HealthBarUpdateDrawer.changeHealth(monster, fromHP, toHP);
    monster.stats.hp = toHP;

    if (monster.isDead()) {
      const totalExp = this.formulaService.getKillExperience(monster);
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
        await this.gainExpFlow.gainExpMonster(m, exp);
      }
    }
  }
}
