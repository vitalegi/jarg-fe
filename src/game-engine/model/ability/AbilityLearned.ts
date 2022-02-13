import { asInt, asString } from "@/utils/JsonUtil";

export default class AbilityLearned {
  abilityId = "";
  maxUsages = 0;
  currentUsages = 0;

  public static fromJson(json: any): AbilityLearned {
    const out = new AbilityLearned();
    out.abilityId = asString(json.abilityId);
    out.maxUsages = asInt(json.maxUsages);
    out.currentUsages = asInt(json.currentUsages);
    return out;
  }

  public clone(): AbilityLearned {
    const out = new AbilityLearned();
    out.abilityId = this.abilityId;
    out.maxUsages = this.maxUsages;
    out.currentUsages = this.currentUsages;
    return out;
  }
}
