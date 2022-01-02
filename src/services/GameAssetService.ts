import MapContainer from "@/models/Map";
import { MonsterIndex } from "@/models/Character";
import SpriteConfig from "@/models/SpriteConfig";
import { Service } from "typedi";
import { BackendWebService } from "./BackendService";
import Ability from "@/game-engine/monster-action/Ability";
import { Animation } from "@/models/Animation";

@Service()
export default class GameAssetService {
  public async getMap(map: string): Promise<MapContainer> {
    const result = await BackendWebService.url(`/static/maps/${map}.json`)
      .get()
      .call();
    return MapContainer.fromJson(result.data);
  }

  public async getMonstersData(): Promise<MonsterIndex[]> {
    const result = await BackendWebService.url(`/static/monsters/monsters.json`)
      .get()
      .call();
    return result.data.map(MonsterIndex.fromJson);
  }

  public async getAnimationMetadata(
    key: string,
    url: string
  ): Promise<Animation> {
    const result = await BackendWebService.url(url).get().call();
    return Animation.fromJson(key, result.data);
  }

  public async getAbilitiesData(): Promise<Ability[]> {
    const result = await BackendWebService.url(
      `/static/monsters/abilities.json`
    )
      .get()
      .call();
    const abilities = result.data.map(Ability.fromJson) as Ability[];
    abilities.forEach((a) => a.validate());
    return abilities;
  }

  public getMapSprite(map: MapContainer, name: string): SpriteConfig {
    const sprite = map.sprites.filter((s) => s.name === name);
    if (sprite) {
      return sprite[0];
    }
    throw Error(`Sprite ${name} not found in map ${map.id}`);
  }
}
