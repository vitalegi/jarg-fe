import MapConfig from "@/models/Map";
import Monster from "@/models/Monster";
import SpriteConfig from "@/models/SpriteConfig";
import { Service } from "typedi";
import { BackendWebService } from "./BackendService";

@Service()
export default class GameAssetService {
  public async getMap(map: string): Promise<MapConfig> {
    const result = await BackendWebService.url(`/maps/${map}.json`)
      .get()
      .call();
    return result.data as MapConfig;
  }
  public async getMonsters(): Promise<Monster[]> {
    const result = await BackendWebService.url(`/monsters/monsters.json`)
      .get()
      .call();
    return result.data as Monster[];
  }
  public getMapSprite(map: MapConfig, name: string): SpriteConfig {
    const sprite = map.sprites.filter((s) => s.name === name);
    if (sprite) {
      return sprite[0];
    }
    throw Error(`Sprite ${name} not found in map ${map.id}`);
  }
}
