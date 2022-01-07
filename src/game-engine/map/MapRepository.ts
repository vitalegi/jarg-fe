import Monster from "@/game-engine/monster/Monster";
import { Service } from "typedi";
import MapContainer from "./MapContainer";
import Tile from "./Tile";

@Service()
export default class MapRepository {
  map: MapContainer | null = null;

  public setMap(map: MapContainer): void {
    this.map = map;
  }
  public getMap(): MapContainer {
    if (this.map) {
      return this.map;
    }
    throw Error(`Map is null`);
  }

  public getMonsterById(uuid: string): Monster {
    return this.getMap().monsters.filter((m) => m.uuid === uuid)[0];
  }

  public getMonstersOnTile(tile: Tile): Monster[] {
    return this.getMap().monsters.filter((m) =>
      tile.coordinates.equals(m.coordinates)
    );
  }
}
