export default class AbilityTarget {
  range = 0;

  public static fromJson(json: any): AbilityTarget {
    const out = new AbilityTarget();
    out.range = json.range;
    return out;
  }
  public clone(): AbilityTarget {
    const out = new AbilityTarget();
    out.range = this.range;
    return out;
  }
  public toJson(): any {
    const out: any = {};
    out.range = this.range;
    return out;
  }

  public validate(): void {
    if (this.range < 0) {
      throw Error(`Range must be >=0, actual ${this.range}`);
    }
  }
}
