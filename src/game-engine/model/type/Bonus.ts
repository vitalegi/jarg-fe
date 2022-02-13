import { asDecimal, asString } from "@/utils/JsonUtil";

export default class Bonus {
  source;
  target;
  ratio;

  public constructor(source = "", target = "", bonus = 0) {
    this.source = source;
    this.target = target;
    this.ratio = bonus;
  }

  public static fromJson(json: any): Bonus {
    return new Bonus(
      asString(json.source),
      asString(json.target),
      asDecimal(json.ratio)
    );
  }

  public clone(): Bonus {
    return new Bonus(this.source, this.target, this.ratio);
  }
  public toString(): string {
    return `Bonus(source=${this.source}, target=${this.target}, ratio=${this.ratio})`;
  }
}
