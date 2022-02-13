import MonsterData from "@/game-engine/model/monster/MonsterData";
import SaveDataVersion from "@/game-engine/save-data/SaveDataVersion";
import { asInt, asString } from "@/utils/JsonUtil";

export default class PlayerData {
  version = SaveDataVersion.LATEST;
  playerId = "";
  monsters: MonsterData[] = [];
  defeatedMaps: string[] = [];
  lastDefeatedTowerMap = 0;
  lastSaveDate = new Date();

  public static fromJson(json: any): PlayerData {
    const out = new PlayerData();
    out.version = asString(json.version);
    out.playerId = asString(json.playerId);
    out.lastDefeatedTowerMap = asInt(json.lastDefeatedTowerMap, 0);

    // TODO handle dates
    out.lastSaveDate = new Date(json.lastSaveDate);
    if (json.monsters) {
      out.monsters = json.monsters.map(MonsterData.fromJson);
    }
    if (json.defeatedMaps) {
      out.defeatedMaps = json.defeatedMaps.map((m: string) => m);
    }
    return out;
  }
  public toJson(): any {
    const out: any = {};
    out.version = this.version;
    out.playerId = this.playerId;
    out.lastDefeatedTowerMap = this.lastDefeatedTowerMap;
    out.lastSaveDate = this.lastSaveDate.toISOString();
    out.monsters = this.monsters.map((m) => m);
    out.defeatedMaps = this.defeatedMaps.map((m) => m);
    return out;
  }
}
