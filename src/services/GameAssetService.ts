import MapContainer from "@/game-engine/map/MapContainer";
import SpriteConfig from "@/models/SpriteConfig";
import { Service } from "typedi";
import { BackendWebService } from "./BackendService";
import Ability from "@/game-engine/monster-action/Ability";
import { Animation } from "@/models/Animation";
import Bonus from "@/game-engine/types/Bonus";
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import MapModel from "@/game-engine/map/MapModel";

@Service()
export default class GameAssetService {
  public async getMap(map: string): Promise<MapModel> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}/maps/${map}.json`
    )
      .get()
      .call();
    return MapModel.fromJson(result.data);
  }

  public async getMonstersData(): Promise<MonsterIndex[]> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}/monsters/monsters.json`
    )
      .get()
      .call();
    return result.data.map(MonsterIndex.fromJson);
  }

  public async getAnimationMetadata(
    key: string,
    url: string
  ): Promise<Animation> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}${url}`
    )
      .get()
      .call();
    return Animation.fromJson(key, result.data);
  }

  public async getTypeBonuses(): Promise<Bonus[]> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}/types/bonus.json`
    )
      .get()
      .call();
    return result.data.map(Bonus.fromJson) as Bonus[];
  }

  public async getAbilitiesData(): Promise<Ability[]> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}/monsters/abilities.json`
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
