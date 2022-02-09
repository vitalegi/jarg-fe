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
import { gameLabel } from "@/services/LocalizationService";
import MapModelRepository from "../map/MapModelRepository";
import MapIndex from "../map/MapIndex";
import GameLoop from "../GameLoop";
import MapRepository from "../map/MapRepository";
import PlayerService from "../PlayerService";

@Service()
export default class SelectNextBattlePhase extends AbstractPhase<never> {
  logger = LoggerFactory.getLogger(
    "GameEngine.GamePhase.SelectNextBattlePhase"
  );
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected mapService = Container.get<MapService>(MapService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected playerService = Container.get<PlayerService>(PlayerService);
  protected phaseService = Container.get<PhaseService>(PhaseService);
  protected statsService = Container.get<StatsService>(StatsService);
  protected mapModelRepository =
    Container.get<MapModelRepository>(MapModelRepository);
  protected gameLoop = Container.get<GameLoop>(GameLoop);

  public getName(): string {
    return "SelectNextBattlePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();

    const menu = new LeftMenu();
    menu.addEntry(this.saveStatus());
    menu.addEntry(this.healParty());
    menu.addEntry(this.towerMode());
    this.mapModelRepository
      .getMaps()
      .forEach((map) => menu.addEntry(this.selectMapEntry(menu, map)));
    menu.draw();
    this.getApp().ticker.add(() => this.gameLoop.gameLoop());
  }

  protected saveStatus(): MenuEntry {
    return new MenuEntry(
      gameLabel("save"),
      () => {
        this.playerRepository.save(this.playerRepository.getPlayerData());
      },
      () => true
    );
  }

  protected healParty(): MenuEntry {
    return new MenuEntry(
      gameLabel("heal-all"),
      () => {
        this.playerRepository
          .getPlayerData()
          .monsters.forEach((m) => this.healMonster(m));
      },
      () => true
    );
  }

  protected towerMode(): MenuEntry {
    return new MenuEntry(
      gameLabel("tower-mode"),
      () => {
        this.phaseService.goToTowerMode();
      },
      () => true
    );
  }

  protected healMonster(monster: Monster): void {
    this.logger.debug(`${monster.uuid}: remove status/stats alterations`);
    monster.activeEffects = [];
    this.logger.debug(`${monster.uuid}: restore stats`);
    this.statsService.updateMonsterAttributes(monster, true);
    this.logger.debug(`${monster.uuid}: restore abilities usages`);
    monster.abilities.forEach((a) => (a.currentUsages = a.maxUsages));
  }

  protected selectMapEntry(menu: LeftMenu, map: MapIndex): MenuEntry {
    return new MenuEntry(
      map.name,
      () => this.selectMap(menu, map),
      () => this.isMapEnabled(map)
    );
  }

  protected isMapEnabled(map: MapIndex): boolean {
    const defeatedMaps = this.playerRepository.getPlayerData().defeatedMaps;
    return this.mapModelRepository.isEnabled(map, defeatedMaps);
  }

  protected defeatedMaps(): string[] {
    return this.playerRepository.getPlayerData().defeatedMaps;
  }

  protected async selectMap(menu: LeftMenu, map: MapIndex): Promise<void> {
    this.logger.info(`Chosen: ${map}`);

    menu.hide();
    const monstersMenuBuilder = new SelectMonstersMenu(
      this.playerRepository.getPlayerData().monsters,
      6,
      1
    );
    const menu2 = monstersMenuBuilder.createMenu(
      (selected: Monster[]) => {
        this.createGame(map, selected);
      },
      () => {
        menu.show();
        menu2.destroy();
      }
    );
    menu2.draw();
  }

  protected async createGame(
    mapIndex: MapIndex,
    monsters: Monster[]
  ): Promise<void> {
    await this.getGameAppDataLoader().loadSpriteConfigs();
    const model = await this.gameAssetService.getMap(mapIndex);
    const map = await this.mapService.generate(
      model,
      mapIndex.id,
      mapIndex.name
    );

    monsters.forEach(
      (m, index) => (m.coordinates = model.playerEntryPoints[index].clone())
    );
    map.monsters.push(...monsters);
    this.phaseService.goToBattle(
      map,
      mapIndex.id,
      () => this.onWin(mapIndex.id),
      () => this.onLoss()
    );
  }

  protected async onWin(id: string): Promise<void> {
    this.logger.info("Player wins");
    this.playerService.completeMap(id);
    this.phaseService.goToSelectNextBattle();
  }
  protected async onLoss(): Promise<void> {
    this.logger.info(`Player is defeated, end.`);
    this.phaseService.goToGameOver();
  }
}
