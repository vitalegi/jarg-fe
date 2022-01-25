import Monster from "@/game-engine/monster/Monster";

export default class Tick {
  monster: Monster;
  ticks = 0;

  public constructor(monster: Monster, ticks = 0) {
    this.monster = monster;
    this.ticks = ticks;
  }

  public toString(): string {
    return `(uuid=${this.monster.uuid.substring(0, 8)}, name=${
      this.monster.name
    }, ticks=${this.ticks})`;
  }

  public toShortString(): string {
    return `${this.monster.name} (${this.ticks})`;
  }
}
