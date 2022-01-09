export default class Bonus {
  source;
  target;
  bonus;

  public constructor(source = "", target = "", bonus = 0) {
    this.source = source;
    this.target = target;
    this.bonus = bonus;
  }

  public static fromJson(json: any): Bonus {
    return new Bonus(json.source, json.target, json.bonus);
  }

  public clone(): Bonus {
    return new Bonus(this.source, this.target, this.bonus);
  }
  public toString(): string {
    return `Bonus(source=${this.source}, target=${this.target}, bonus=${this.bonus})`;
  }
}
