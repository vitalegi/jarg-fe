import { Monster } from "@/models/Character";
import { Service } from "typedi";

@Service()
export default class TurnManager {
  protected turns: string[] = [];

  public addCharacters(monsters: Monster[]): void {
    monsters.forEach((m) => this.addCharacter(m));
  }

  public addCharacter(monster: Monster): void {
    this.turns.push(monster.uuid);
  }

  public initTurns(): void {
    return;
  }
  public hasCharacters(): boolean {
    return this.turns.length > 0;
  }
  public activeCharacter(): string {
    return this.turns[0];
  }

  public next(): void {
    const first = this.turns.splice(0, 1);
    this.turns.push(...first);
  }

  public getTurns(): string[] {
    return this.turns;
  }
}
