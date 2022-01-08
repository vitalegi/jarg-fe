import MapContainer from "@/game-engine/map/MapContainer";
import GameAssetService from "@/services/GameAssetService";
import Container, { Service } from "typedi";
import MonsterIndexService from "../monster/MonsterIndexService";
import MonsterService from "../monster/MonsterService";
import PlayerRepository from "../repositories/PlayerRepository";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import BattlePhase from "./BattlePhase";
import MapService from "../map/MapService";

const MAPS = ["map1", "map2", "map3", "map4"];

@Service()
export default class SelectNextBattlePhase extends AbstractPhase<never> {
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected mapService = Container.get<MapService>(MapService);

  public getName(): string {
    return "SelectNextBattlePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();

    const menu = new LeftMenu();
    for (const map of MAPS) {
      menu.addEntry(this.selectMapEntry(map));
    }
    menu.draw();
  }

  protected selectMapEntry(map: string): MenuEntry {
    return new MenuEntry(
      map,
      () => this.selectMap(map),
      () => this.isMapEnabled(map)
    );
  }

  protected isMapEnabled(map: string): boolean {
    if (map === "map1") {
      return true;
    }
    const defeated = this.defeatedMaps();
    if (defeated.length === 0) {
      return false;
    }
    if (defeated.indexOf(map) !== -1) {
      return true;
    }
    const lastDefeated = defeated[defeated.length - 1];
    const nextToDefeat = MAPS.indexOf(lastDefeated) + 1;
    return map === MAPS[nextToDefeat];
  }

  protected defeatedMaps(): string[] {
    return this.playerRepository.getPlayerData().defeatedMaps;
  }

  protected async selectMap(mapId: string): Promise<void> {
    console.log(`Chosen: ${mapId}`);

    const model = await this.gameAssetService.getMap(mapId);
    const map = await this.mapService.generate(model);

    map.monsters.push(...this.playerRepository.getPlayerData().monsters);

    this.goToBattlePhase(map);
  }

  protected async goToBattlePhase(map: MapContainer): Promise<void> {
    await Container.get<BattlePhase>(BattlePhase).start(map);
  }
}
