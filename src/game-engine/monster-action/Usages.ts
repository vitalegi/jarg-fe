export default class Usages {
  current = 0;
  max = 0;

  public static fromJson(json: any): Usages {
    const out = new Usages();
    out.current = json.current;
    out.max = json.max;
    return out;
  }
  public clone(): Usages {
    const out = new Usages();
    out.current = this.current;
    out.max = this.max;
    return out;
  }

  public validate(): void {
    if (this.current < 0) {
      throw Error(`Current must be >=0, actual ${this.current}`);
    }
    if (this.max < 0) {
      throw Error(`Max must be >=0, actual ${this.max}`);
    }
  }
}
