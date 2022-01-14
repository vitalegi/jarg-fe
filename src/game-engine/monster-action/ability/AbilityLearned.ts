export default class AbilityLearned {
  abilityId = "";
  maxUsages = 0;
  currentUsages = 0;

  public static fromJson(json: any): AbilityLearned {
    const out = new AbilityLearned();
    out.abilityId = json.abilityId;
    out.maxUsages = json.maxUsages;
    out.currentUsages = json.currentUsages;
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
