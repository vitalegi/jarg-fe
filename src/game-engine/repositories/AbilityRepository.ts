import Ability from "@/game-engine/model/ability/Ability";
import { Service } from "typedi";

@Service()
export default class AbilityRepository {
  private abilities = new Map<string, Ability>();

  public init(abilities: Ability[]): void {
    this.abilities = new Map<string, Ability>();
    abilities.forEach((ability) => this.abilities.set(ability.id, ability));
  }

  public getAbility(abilityId: string): Ability {
    const ability = this.abilities.get(abilityId);
    if (ability) {
      return ability;
    }
    throw new Error(`Missing ability ${abilityId}.`);
  }

  public getAbilities(): Ability[] {
    const abilities: Ability[] = [];
    this.abilities.forEach((value) => abilities.push(value));
    return abilities;
  }
}
