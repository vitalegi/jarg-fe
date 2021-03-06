import { asDecimal, asString } from "@/utils/JsonUtil";

export default class Candidates {
  ids: string[] = [];
  probability = 0;

  public static fromJson(json: any): Candidates {
    const out = new Candidates();
    if (json.ids) {
      out.ids = json.ids.map((id: any) => asString(id));
    }
    out.probability = asDecimal(json.probability);
    return out;
  }
  public clone(): Candidates {
    const out = new Candidates();
    out.ids = this.ids.map((id) => id);
    out.probability = this.probability;
    return out;
  }
}
