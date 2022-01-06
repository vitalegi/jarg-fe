/*{
    "area": [],
    "encounters": [
      {
        "monsterId": "015",
        "levelMin": 1,
        "levelMax": 5,
        "probability": 0.4
      },
      {
        "monsterId": "100",
        "levelMin": 5,
        "levelMax": 15,
        "probability": 0.4
      },
      {
        "monsterId": "150",
        "levelMin": 5,
        "levelMax": 15,
        "probability": 0.2
      }
    ]
  }*/

import Point from "@/models/Point";
import RandomEncounter from "./RandomEncounter";

export default class LocalizedEncounters {
  area: Point[] = [];
  minMonsters = 0;
  maxMonsters = 0;
  encounters: RandomEncounter[] = [];

  public static fromJson(json: any): LocalizedEncounters {
    const out = new LocalizedEncounters();
    if (json.area) {
      out.area = json.area.map((p: any) => Point.fromJson(p));
    }
    out.minMonsters = json.minMonsters;
    out.maxMonsters = json.maxMonsters;
    if (json.encounters) {
      out.encounters = json.encounters.map((e: any) =>
        RandomEncounter.fromJson(e)
      );
    }
    return out;
  }
}
