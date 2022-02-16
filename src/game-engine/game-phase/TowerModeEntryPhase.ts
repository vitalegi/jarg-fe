import GameAssetService from "@/services/GameAssetService";
import Container, { Service } from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import AbstractPhase from "@/game-engine/game-phase/AbstractPhase";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import PlayerRepository from "@/game-engine/repositories/PlayerRepository";
import MonsterService from "@/game-engine/monster/MonsterService";
import MapService from "@/game-engine/map/MapService";
import PhaseService from "@/game-engine/game-phase/PhaseService";
import StatsService from "@/game-engine/monster/stats/StatsService";
import MapModelRepository from "@/game-engine/map/MapModelRepository";
import GameLoop from "@/game-engine/GameLoop";
import PlayerService from "@/game-engine/PlayerService";
import TowerMapService from "@/game-engine/map/TowerMapService";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import Monster from "@/game-engine/model/monster/Monster";
import TransitionFactory from "@/game-engine/ui/scene-transition/TransitionFactory";
import SelectMonsters from "@/game-engine/ui/monster-selection/SelectMonsters";

@Service()
export default class TowerModeEntryPhase extends AbstractPhase<never> {
  logger = LoggerFactory.getLogger("GameEngine.GamePhase.TowerModeEntryPhase");
  protected monsterIndexService = Container.get(MonsterIndexService);
  protected playerRepository = Container.get(PlayerRepository);
  protected monsterService = Container.get(MonsterService);
  protected gameAssetService = Container.get(GameAssetService);
  protected mapService = Container.get(MapService);
  protected phaseService = Container.get(PhaseService);
  protected statsService = Container.get(StatsService);
  protected mapModelRepository = Container.get(MapModelRepository);
  protected gameLoop = Container.get(GameLoop);
  private towerMapService = Container.get(TowerMapService);
  protected playerService = Container.get(PlayerService);
  private transitionFactory = Container.get(TransitionFactory);

  public getName(): string {
    return "TowerModeEntryPhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();

    const menu = new LeftMenu();
    let level = 1;
    while (this.isAvailable(level)) {
      menu.addEntry(this.level(menu, level));
      level++;
    }
    menu.draw();
    this.getApp().ticker.add(() => this.gameLoop.gameLoop());
  }

  protected level(menu: LeftMenu, level: number): MenuEntry {
    return new MenuEntry(
      `${level}`,
      () => this.selectLevel(menu, level),
      () => true
    );
  }

  protected isAvailable(level: number): boolean {
    if (level === 1) {
      return true;
    }
    const data = this.playerService.getPlayerData();
    return level <= data.lastDefeatedTowerMap + 1;
  }

  protected async selectLevel(menu: LeftMenu, level: number): Promise<void> {
    this.logger.info(`Chosen: ${level}`);
    menu.hide();

    const playerMonsters = await this.monsterService.createExistingMonsters(
      this.playerService.getPlayerMonsters()
    );

    menu.hide();
    const selector = new SelectMonsters(playerMonsters, 6, 1);
    this.gameLoop.addGameLoopHandler(selector);
    const out = await selector.notifyWhenCompleted();
    if (out.confirm) {
      this.playerService.updateRecentlyPlayedMonsters(out.selected);
      this.createGame(level, out.selected);
    } else {
      menu.show();
    }
  }

  protected async createGame(
    level: number,
    monsters: Monster[]
  ): Promise<void> {
    await this.getGameAppDataLoader().loadSpriteConfigs();
    const model = await this.towerMapService.create(level);
    const map = await this.mapService.generate(model);

    monsters.forEach(
      (m, index) => (m.coordinates = model.playerEntryPoints[index].clone())
    );
    map.monsters.push(...monsters);
    await this.transitionFactory.transition("squared");
    this.phaseService.goToBattle(
      map,
      `${level}`,
      () => this.onWin(level, monsters),
      () => this.onLoss()
    );
  }

  protected async onWin(level: number, monsters: Monster[]): Promise<void> {
    this.logger.info("Player wins");
    await this.transitionFactory.transition("squared");
    this.playerService.completeTowerMap(level);
    monsters.forEach((monster) => this.playerService.updateMonster(monster));
    this.phaseService.goToSelectNextBattle();
  }
  protected async onLoss(): Promise<void> {
    this.logger.info(`Player is defeated, end.`);
    await this.transitionFactory.transition("squared");
    this.phaseService.goToGameOver();
  }
}
