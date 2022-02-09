import MapContainer from "@/game-engine/map/MapContainer";
import SpriteConfig from "@/models/SpriteConfig";
import { Service } from "typedi";
import { BackendWebService } from "./BackendService";
import Ability from "@/game-engine/monster-action/ability/Ability";
import { Animation } from "@/models/Animation";
import Bonus from "@/game-engine/types/Bonus";
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import MapModel from "@/game-engine/map/MapModel";
import MapIndex from "@/game-engine/map/MapIndex";
import TowerModeConfig from "@/game-engine/map/tower-mode/TowerModeConfig";

@Service()
export default class GameAssetService {
  public async getMaps(): Promise<MapIndex[]> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}/maps/maps.json`
    )
      .get()
      .call();
    return result.data.map((m: any) => MapIndex.fromJson(m));
  }
  public async getMap(map: MapIndex): Promise<MapModel> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}${map.url}`
    )
      .get()
      .call();
    return MapModel.fromJson(result.data);
  }
  public async getTowerConfigs(): Promise<TowerModeConfig[]> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}/maps/tower-mode.json`
    )
      .get()
      .call();
    return result.data.map(TowerModeConfig.fromJson);
  }
  public async getMonstersData(): Promise<MonsterIndex[]> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}/monsters/monsters.json`
    )
      .get()
      .call();
    return result.data.map(MonsterIndex.fromJson);
  }

  public async getSpriteConfigs(): Promise<SpriteConfig[]> {
    const result = await BackendWebService.url(
      `${process.env.VUE_APP_BACKEND}/tiles/sprites.json`
    )
      .get()
      .call();
    return result.data.map(SpriteConfig.fromJson);
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
}
