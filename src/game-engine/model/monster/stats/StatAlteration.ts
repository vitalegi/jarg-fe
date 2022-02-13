import { asDecimal, asString } from "@/utils/JsonUtil";

export default class StatAlteration {
  stat;
  percentage;

  public constructor(stat: string, percentage = 0) {
    this.stat = stat;
    this.percentage = percentage;
  }

  public static fromJson(json: any): StatAlteration {
    return new StatAlteration(asString(json.stat), asDecimal(json.percentage));
  }

  public clone(): StatAlteration {
    return new StatAlteration(this.stat, this.percentage);
  }
}
