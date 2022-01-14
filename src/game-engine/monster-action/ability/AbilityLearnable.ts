export default class AbilityLearnable {
  public static BY_LEVEL = "BY_LEVEL";

  type = AbilityLearnable.BY_LEVEL;
  level = 0;

  public static fromJson(json: any): AbilityLearnable {
    const out = new AbilityLearnable();
    out.type = json.type;
    out.level = json.level;
    return out;
  }

  public clone(): AbilityLearnable {
    const out = new AbilityLearnable();
    out.type = this.type;
    out.level = this.level;
    return out;
  }
}
