import { Service } from "typedi";

@Service()
export default class MapModelRepository {
  public getMaps(): string[] {
    return ["map1", "map2"];
  }

  public isEnabled(mapId: string, defeatedMaps: string[]): boolean {
    const maps = this.getMaps();
    if (mapId === maps[0]) {
      return true;
    }
    if (defeatedMaps.indexOf(mapId) !== -1) {
      return true;
    }
    const lastDefeated = defeatedMaps[defeatedMaps.length - 1];
    const nextToDefeat = maps.indexOf(lastDefeated) + 1;
    return mapId === maps[nextToDefeat];
  }
}
