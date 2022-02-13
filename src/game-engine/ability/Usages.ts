import { asInt } from "@/utils/JsonUtil";

export default class Usages {
  current = 0;
  max = 0;

  public static fromJson(json: any): Usages {
    const out = new Usages();
    out.current = asInt(json.current);
    out.max = asInt(json.max);
    return out;
  }
  public clone(): Usages {
    const out = new Usages();
    out.current = this.current;
    out.max = this.max;
    return out;
  }

  public toJson(): any {
    const out: any = {};
    out.current = this.current;
    out.max = this.max;
    return out;
  }

  public validate(): void {
    if (this.current <= 0) {
      throw Error(`Base usages must be >0, actual ${this.current}`);
    }
    if (this.max < this.current) {
      throw Error(`Max usages must be >= base, actual ${this.max}`);
    }
  }
}
