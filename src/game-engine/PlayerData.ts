import Monster from "@/game-engine/monster/Monster";

export default class PlayerData {
  playerId = "";
  monsters: Monster[] = [];
  defeatedMaps: string[] = [];

  public static fromJson(json: any): PlayerData {
    const out = new PlayerData();
    out.playerId = json.playerId;
    if (json.monsters) {
      out.monsters = json.monsters.map(Monster.fromJson);
    }
    if (json.defeatedMaps) {
      out.defeatedMaps = json.defeatedMaps.map((m: string) => m);
    }
    return out;
  }
}
