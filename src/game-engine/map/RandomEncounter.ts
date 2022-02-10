import { asDecimal, asInt, asString } from "@/utils/JsonUtil";

export default class RandomEncounter {
  monsterId = "";
  levelMin = 0;
  levelMax = 0;
  probability = 0;

  public static fromJson(json: any): RandomEncounter {
    const out = new RandomEncounter();
    out.monsterId = asString(json.monsterId);
    out.levelMin = asInt(json.levelMin);
    out.levelMax = asInt(json.levelMax);
    out.probability = asDecimal(json.probability);
    return out;
  }

  public clone(): RandomEncounter {
    const out = new RandomEncounter();
    out.monsterId = this.monsterId;
    out.levelMin = this.levelMin;
    out.levelMax = this.levelMax;
    out.probability = this.probability;
    return out;
  }

  public toString(): string {
    return `monsterId=${this.monsterId}, levelMin=${this.levelMin}, levelMax=${this.levelMax}, probability=${this.probability}`;
  }
}
