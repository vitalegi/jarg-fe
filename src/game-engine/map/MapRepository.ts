import Monster from "@/game-engine/monster/Monster";
import Point from "@/models/Point";
import { Service } from "typedi";
import MapContainer from "./MapContainer";
import Tile from "./Tile";

@Service()
export default class MapRepository {
  map: MapContainer | null = null;
  id = "";
  onWin?: () => Promise<void>;
  onLoss?: () => Promise<void>;

  public setMap(
    map: MapContainer,
    id: string,
    onWin: () => Promise<void>,
    onLoss: () => Promise<void>
  ): void {
    this.map = map;
    this.id = id;
    this.onWin = onWin;
    this.onLoss = onLoss;
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
    return this.getMonstersOnCoordinates(tile.coordinates);
  }

  public getMonstersOnCoordinates(coordinates: Point): Monster[] {
    return this.getMap().monsters.filter((m) =>
      coordinates.equals(m.coordinates)
    );
  }
  public getAllies(monster: Monster): Monster[] {
    return this.getMap().monsters.filter((m) => m.ownerId === monster.ownerId);
  }
}
