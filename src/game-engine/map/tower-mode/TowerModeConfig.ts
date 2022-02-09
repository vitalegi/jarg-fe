import Candidates from "./Candidates";

export default class TowerModeConfig {
  preconditions: { level_ge: number; level_le?: number } = { level_ge: 0 };
  theme: string[] = [];
  candidates: Candidates[] = [];

  public static fromJson(json: any): TowerModeConfig {
    const out = new TowerModeConfig();
    out.preconditions.level_ge = json.preconditions.level_ge;
    out.preconditions.level_le = json.preconditions.level_le;
    out.theme = json.theme.map((t: any) => t);
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