import Point from "@/models/Point";
import { asInt } from "@/utils/JsonUtil";
import RandomEncounter from "./RandomEncounter";

export default class LocalizedEncounters {
  area: Point[] = [];
  minMonsters = 0;
  maxMonsters = 0;
  encounters: RandomEncounter[] = [];

  public clone(): LocalizedEncounters {
    const out = new LocalizedEncounters();
    out.area = this.area.map((p) => p.clone());
    out.minMonsters = this.minMonsters;
    out.maxMonsters = this.maxMonsters;
    out.encounters = this.encounters.map((e) => e.clone());
    return out;
  }

  public static fromJson(json: any): LocalizedEncounters {
    const out = new LocalizedEncounters();
    if (json.area) {
      out.area = json.area.map((p: any) => Point.fromJson(p));
    }
    out.minMonsters = asInt(json.minMonsters);
    out.maxMonsters = asInt(json.maxMonsters);
    if (json.encounters) {
      out.encounters = json.encounters.map((e: any) =>
        RandomEncounter.fromJson(e)
      );
    }
    return out;
  }
}
