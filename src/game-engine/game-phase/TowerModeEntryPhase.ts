import GameAssetService from "@/services/GameAssetService";
import Container, { Service } from "typedi";
import MonsterIndexService from "../monster/MonsterIndexService";
import MonsterService from "../monster/MonsterService";
import PlayerRepository from "../repositories/PlayerRepository";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import MapService from "../map/MapService";
import LoggerFactory from "@/logger/LoggerFactory";
import SelectMonstersMenu from "../ui/SelectMonstersMenu";
import Monster from "../monster/Monster";
import PhaseService from "./PhaseService";
import StatsService from "../monster/stats/StatsService";
import MapModelRepository from "../map/MapModelRepository";
import GameLoop from "../GameLoop";
import TowerMapService from "../map/TowerMapService";
import PlayerService from "../PlayerService";

@Service()
export default class TowerModeEntryPhase extends AbstractPhase<never> {
  logger = LoggerFactory.getLogger("GameEngine.GamePhase.TowerModeEntryPhase");
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected mapService = Container.get<MapService>(MapService);
  protected phaseService = Container.get<PhaseService>(PhaseService);
  protected statsService = Container.get<StatsService>(StatsService);
  protected mapModelRepository =
    Container.get<MapModelRepository>(MapModelRepository);
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  private towerMapService = Container.get<TowerMapService>(TowerMapService);
  protected playerService = Container.get<PlayerService>(PlayerService);

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
    const monstersMenuBuilder = new SelectMonstersMenu(
      this.playerRepository.getPlayerData().monsters,
      6,
      1
    );
    const menu2 = monstersMenuBuilder.createMenu(
      (selected: Monster[]) => {
        this.createGame(level, selected);
      },
      () => {
        menu.show();
        menu2.destroy();
      }
    );
    menu2.draw();
  }

  protected async createGame(
    level: number,
    monsters: Monster[]
  ): Promise<void> {
    await this.getGameAppDataLoader().loadSpriteConfigs();
    const model = await this.towerMapService.create(level);
    const map = await this.mapService.generate(
      model,
      `TOWER_${level}`,
      `Tower - ${level}`
    );

    monsters.forEach(
      (m, index) => (m.coordinates = model.playerEntryPoints[index].clone())
    );
    map.monsters.push(...monsters);
    this.phaseService.goToBattle(
      map,
      `${level}`,
      () => this.onWin(level),
      () => this.onLoss()
    );
  }

  protected async onWin(level: number): Promise<void> {
    this.logger.info("Player wins");
    this.playerService.completeTowerMap(level);
    this.phaseService.goToSelectNextBattle();
  }
  protected async onLoss(): Promise<void> {
    this.logger.info(`Player is defeated, end.`);
    this.phaseService.goToGameOver();
  }
}
