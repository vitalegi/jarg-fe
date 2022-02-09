import { Service } from "typedi";
import TowerModeConfig from "../map/tower-mode/TowerModeConfig";

@Service()
export default class TowerModeRepository {
  private configs = new Array<TowerModeConfig>();

  public init(configs: TowerModeConfig[]): void {
    this.configs = configs.map((b) => b.clone());
  }

  public getConfig(level: number): TowerModeConfig {
    const cfg = this.configs
      .filter((c) => c.preconditions.level_ge <= level)
      .filter(
        (c) => c.preconditions.level_le && level <= c.preconditions.level_le
      );
    if (cfg.length === 0) {
      throw Error(`No configuration available for level ${level}`);
    }
    return cfg[0];
  }
}
