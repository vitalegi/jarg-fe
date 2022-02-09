import Monster from "@/game-engine/monster/Monster";
import SaveDataVersion from "./save-data/SaveDataVersion";

export default class PlayerData {
  version = SaveDataVersion.LATEST;
  playerId = "";
  monsters: Monster[] = [];
  defeatedMaps: string[] = [];
  lastDefeatedTowerMap = 0;
  lastSaveDate = new Date();

  public static fromJson(json: any): PlayerData {
    const out = new PlayerData();
    out.version = json.version;
    out.playerId = json.playerId;
    out.lastDefeatedTowerMap = json.lastDefeatedTowerMap;
    out.lastSaveDate = new Date(json.lastSaveDate);
    if (json.monsters) {
      out.monsters = json.monsters.map(Monster.fromJson);
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
