import { asInt, asIntNullable, asString } from "@/utils/JsonUtil";
import Candidates from "./Candidates";

export default class TowerModeConfig {
  preconditions: { level_ge: number; level_le: null | number } = {
    level_ge: 0,
    level_le: 0,
  };
  theme: string[] = [];
  candidates: Candidates[] = [];

  public static fromJson(json: any): TowerModeConfig {
    const out = new TowerModeConfig();
    out.preconditions.level_ge = asInt(json.preconditions.level_ge);
    out.preconditions.level_le = asIntNullable(json.preconditions.level_le);
    out.theme = json.theme.map((t: any) => asString(t));
    out.candidates = json.candidates.map(Candidates.fromJson);
    return out;
  }

  public clone(): TowerModeConfig {
    const out = new TowerModeConfig();
    out.preconditions.level_ge = this.preconditions.level_ge;
    out.preconditions.level_le = this.preconditions.level_le;
    out.theme = this.theme.map((t) => t);
    out.candidates = this.candidates.map((c) => c.clone());
    return out;
  }
}
