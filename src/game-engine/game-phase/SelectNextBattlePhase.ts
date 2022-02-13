import GameAssetService from "@/services/GameAssetService";
import Container, { Service } from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import AbstractPhase from "@/game-engine/game-phase/AbstractPhase";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import PlayerRepository from "@/game-engine/repositories/PlayerRepository";
import MonsterService from "@/game-engine/monster/MonsterService";
import MapService from "@/game-engine/map/MapService";
import MapRepository from "@/game-engine/map/MapRepository";
import PlayerService from "@/game-engine/PlayerService";
import PhaseService from "@/game-engine/game-phase/PhaseService";
import StatsService from "@/game-engine/monster/stats/StatsService";
import MapModelRepository from "@/game-engine/map/MapModelRepository";
import GameLoop from "@/game-engine/GameLoop";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import MonsterData from "@/game-engine/monster/MonsterData";
import MapIndex from "@/game-engine/model/map/MapIndex";
import SelectMonstersMenu from "@/game-engine/ui/SelectMonstersMenu";
import Monster from "@/game-engine/monster/Monster";

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

  protected healMonster(monster: MonsterData): void {
    this.logger.debug(`${monster.uuid}: remove status/stats alterations`);
    monster.activeEffects = [];
    this.logger.debug(`${monster.uuid}: restore stats`);
    monster.hp = null;
    monster.activeEffects = [];
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

    const playerMonsters = await this.monsterService.createExistingMonsters(
      this.playerService.getPlayerMonsters()
    );

    menu.hide();
    const monstersMenuBuilder = new SelectMonstersMenu(playerMonsters, 6, 1);
    const menu2 = monstersMenuBuilder.createMenu(
      (selected: Monster[]) => this.createGame(map, selected),
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
      () => this.onWin(mapIndex.id, monsters),
      () => this.onLoss()
    );
  }

  protected async onWin(id: string, monsters: Monster[]): Promise<void> {
    this.logger.info("Player wins");
    this.playerService.completeMap(id);
    monsters.forEach((monster) => this.playerService.updateMonster(monster));
    this.phaseService.goToSelectNextBattle();
  }
  protected async onLoss(): Promise<void> {
    this.logger.info(`Player is defeated, end.`);
    this.phaseService.goToGameOver();
  }
}
