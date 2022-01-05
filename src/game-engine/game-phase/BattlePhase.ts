import GameService from "@/services/GameService";
import Container, { Service } from "typedi";
import MapContainer from "../map/MapContainer";
import MonsterIndexService from "../monster/MonsterIndexService";
import AbstractPhase from "./AbstractPhase";

@Service()
export default class BattlePhase extends AbstractPhase<MapContainer> {
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);

  public getName(): string {
    return "BattlePhase";
  }
  protected async doStart(map: MapContainer | null): Promise<void> {
    if (!map) {
      throw Error(`Map is null`);
    }
    await this.getGameAppDataLoader().loadMonsters();
    Container.get<GameService>(GameService).init();
  }
}
