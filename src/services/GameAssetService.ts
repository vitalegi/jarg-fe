import MapContainer from "@/models/Map";
import { Monster, MonsterIndex } from "@/models/Character";
import SpriteConfig from "@/models/SpriteConfig";
import { Service } from "typedi";
import { BackendWebService } from "./BackendService";

@Service()
export default class GameAssetService {
  public async getMap(map: string): Promise<MapContainer> {
    const result = await BackendWebService.url(`/maps/${map}.json`)
      .get()
      .call();
    return MapContainer.fromJson(result.data);
  }
  public async getMonstersData(): Promise<MonsterIndex[]> {
    const result = await BackendWebService.url(`/monsters/monsters.json`)
      .get()
      .call();
    return result.data.map((data: any) => MonsterIndex.fromJson(data));
  }
  public getMapSprite(map: MapContainer, name: string): SpriteConfig {
    const sprite = map.sprites.filter((s) => s.name === name);
    if (sprite) {
      return sprite[0];
    }
    throw Error(`Sprite ${name} not found in map ${map.id}`);
  }
}
