export default class RandomEncounter {
  monsterId = "";
  levelMin = 0;
  levelMax = 0;
  probability = 0;

  public static fromJson(json: any): RandomEncounter {
    const out = new RandomEncounter();
    out.monsterId = json.monsterId;
    out.levelMin = json.levelMin;
    out.levelMax = json.levelMax;
    out.probability = json.probability;
    return out;
  }
}
