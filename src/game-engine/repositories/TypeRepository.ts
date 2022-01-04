import { Service } from "typedi";
import Bonus from "../types/Bonus";

@Service()
export default class TypeRepository {
  private types = new Array<string>();
  private bonuses = new Array<Bonus>();

  public init(bonuses: Bonus[]): void {
    this.bonuses = bonuses.map((b) => b.clone());
    this.types = [...new Set(bonuses.map((b) => b.attacker))];
  }

  public getBonus(attacker: string, target: string): number {
    const bonus = this.bonuses
      .filter((b) => b.attacker === attacker)
      .filter((b) => b.target === target);
    if (bonus.length === 1) {
      return bonus[0].bonus;
    }
    if (bonus.length === 0) {
      throw new Error(`Missing bonus for ${attacker} / ${target}`);
    }
    throw new Error(`Too many bonuses for ${attacker} / ${target}: ${bonus}`);
  }

  public getTypes(): string[] {
    return this.types;
  }
}
