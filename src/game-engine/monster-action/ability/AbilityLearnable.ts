import { asInt, asString } from "@/utils/JsonUtil";

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
    out.type = asString(json.type);
    out.abilityId = asString(json.abilityId);
    out.level = asInt(json.level);
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
      return `AbilityLearnable type=${this.type}, abilityId=${this.abilityId}, level=${this.level}`;
    }
    return `AbilityLearnable type=${this.type}, abilityId=${this.abilityId}`;
  }
}
