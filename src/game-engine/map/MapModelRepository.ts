import MapIndex from "@/game-engine/map/MapIndex";
import { Service } from "typedi";

@Service()
export default class MapModelRepository {
  private maps: MapIndex[] = [];

  public init(maps: MapIndex[]): void {
    this.maps = maps;
  }

  public getMaps(): MapIndex[] {
    return this.maps.map((m) => m.clone());
  }

  public getMap(id: string): MapIndex {
    const found = this.maps.filter((m) => m.id === id);
    if (found.length > 0) {
      return found[0];
    }
    throw Error(`Map ${id} not found. ${this.maps.length} maps available`);
  }

  public isEnabled(map: MapIndex, defeatedMaps: string[]): boolean {
    for (const prerequisite of map.prerequisites) {
      if (defeatedMaps.indexOf(prerequisite) === -1) {
        return false;
      }
    }
    return true;
  }
}
