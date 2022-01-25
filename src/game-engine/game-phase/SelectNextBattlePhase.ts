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
  protected phaseService = Container.get<PhaseService>(PhaseService);
  protected statsService = Container.get<StatsService>(StatsService);
  protected mapModelRepository =
    Container.get<MapModelRepository>(MapModelRepository);

  public getName(): string {
    return "SelectNextBattlePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();

    const menu = new LeftMenu();
    menu.addEntry(this.saveStatus());
    menu.addEntry(this.healParty());
    this.mapModelRepository
      .getMaps()
      .forEach((mapId) => menu.addEntry(this.selectMapEntry(menu, mapId)));
    menu.draw();
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

  protected healMonster(monster: Monster): void {
    this.logger.info(`${monster.uuid}: remove status/stats alterations`);
    monster.activeEffects = [];
    this.logger.info(`${monster.uuid}: restore stats`);
    this.statsService.updateMonsterAttributes(monster, true);
    this.logger.info(`${monster.uuid}: restore abilities usages`);
    monster.abilities.forEach((a) => (a.currentUsages = a.maxUsages));
  }

  protected selectMapEntry(menu: LeftMenu, map: string): MenuEntry {
    return new MenuEntry(
      map,
      () => this.selectMap(menu, map),
      () => this.isMapEnabled(map)
    );
  }

  protected isMapEnabled(mapId: string): boolean {
    const defeatedMaps = this.playerRepository.getPlayerData().defeatedMaps;
    return this.mapModelRepository.isEnabled(mapId, defeatedMaps);
  }

  protected defeatedMaps(): string[] {
    return this.playerRepository.getPlayerData().defeatedMaps;
  }

  protected async selectMap(menu: LeftMenu, mapId: string): Promise<void> {
    this.logger.info(`Chosen: ${mapId}`);

    menu.hide();
    const monstersMenuBuilder = new SelectMonstersMenu(
      this.playerRepository.getPlayerData().monsters,
      6,
      1
    );
    const menu2 = monstersMenuBuilder.createMenu(
      (selected: Monster[]) => {
        this.createGame(mapId, selected);
      },
      () => {
        menu.show();
        menu2.destroy();
      }
    );
    menu2.draw();
  }

  protected async createGame(
    mapId: string,
    monsters: Monster[]
  ): Promise<void> {
    const model = await this.gameAssetService.getMap(mapId);
    const map = await this.mapService.generate(model);

    monsters.forEach(
      (m, index) => (m.coordinates = model.playerEntryPoints[index].clone())
    );
    map.monsters.push(...monsters);
    this.phaseService.goToBattle(map);
  }
}
