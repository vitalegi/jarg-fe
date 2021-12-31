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

  public removeCharacter(uuid: string): void {
    this.turns = this.turns.filter((id) => id !== uuid);
  }

  public initTurns(): void {
    // TODO implement
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

  public getTurns(n: number): string[] {
    const turns: string[] = [];
    if (this.turns.length === 0) {
      return turns;
    }
    for (let i = 0; i < n; i++) {
      turns.push(this.turns[i % this.turns.length]);
    }
    return turns;
  }
}
