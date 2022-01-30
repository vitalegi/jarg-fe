import { Service } from "typedi";
import Bonus from "../types/Bonus";

@Service()
export default class TypeRepository {
  private bonuses = new Array<Bonus>();

  public init(bonuses: Bonus[]): void {
    this.bonuses = bonuses.map((b) => b.clone());
  }

  public getBonus(source: string, target: string): number {
    const bonus = this.bonuses
      .filter((b) => b.source === source)
      .filter((b) => b.target === target);
    if (bonus.length === 1) {
      return bonus[0].ratio;
    }
    if (bonus.length === 0) {
      throw new Error(`Missing bonus for ${source} / ${target}`);
    }
    throw new Error(`Too many bonuses for ${source} / ${target}: ${bonus}`);
  }
}
