export default class Bonus {
  attacker;
  target;
  bonus;

  public constructor(attacker = "", target = "", bonus = 0) {
    this.attacker = attacker;
    this.target = target;
    this.bonus = bonus;
  }

  public static fromJson(json: any): Bonus {
    return new Bonus(json.attacker, json.target, json.bonus);
  }

  public clone(): Bonus {
    return new Bonus(this.attacker, this.target, this.bonus);
  }
  public toString(): string {
    return `Bonus(attacker=${this.attacker}, target=${this.target}, bonus=${this.bonus})`;
  }
}
