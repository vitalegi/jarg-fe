export default class AbilityLearnable {
  public static BY_LEVEL = "BY_LEVEL";

  type = AbilityLearnable.BY_LEVEL;
  abilityId = "";
  level = 0;

  public static byLevel(abilityId: string, level: number) {
    const ability = new AbilityLearnable();
    ability.abilityId = abilityId;
    ability.level = level;
    ability.type = AbilityLearnable.BY_LEVEL;
    return ability;
  }

  public static fromJson(json: any): AbilityLearnable {
    const out = new AbilityLearnable();
    out.type = json.type;
    out.abilityId = json.abilityId;
    out.level = json.level;
    return out;
  }

  public clone(): AbilityLearnable {
    const out = new AbilityLearnable();
    out.type = this.type;
    out.abilityId = this.abilityId;
    out.level = this.level;
    return out;
  }
  public toString(): string {
    if (this.type === AbilityLearnable.BY_LEVEL) {
      return `AbilityLearnable by level abilityId=${this.abilityId}, level=${this.level}`;
    }
    return `AbilityLearnable type=${this.type}, abilityId=${this.abilityId}`;
  }
}
