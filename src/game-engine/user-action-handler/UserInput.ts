import Point from "@/models/Point";

export default class UserInput {
  type: "monster" | "terrain" | null = null;
  uuid: string | null = null;
  position: Point | null = null;

  public static monsterInput(uuid: string): UserInput {
    const input = new UserInput();
    input.type = "monster";
    input.uuid = uuid;
    return input;
  }
  public static terrainInput(position: Point): UserInput {
    const input = new UserInput();
    input.type = "terrain";
    input.position = position;
    return input;
  }

  public isMonster(): boolean {
    return this.type === "monster" && !!this.uuid;
  }
  public isTerrain(): boolean {
    return this.type === "terrain" && !!this.position;
  }
  public getMonsterId(): string {
    if (this.uuid) {
      return this.uuid;
    }
    throw Error(
      "Malformed UserInput, no UUID provided " + JSON.stringify(this)
    );
  }
  public getPosition(): Point {
    if (this.position) {
      return this.position;
    }
    throw Error(
      "Malformed UserInput, no position provided" + JSON.stringify(this)
    );
  }

  public toString(): string {
    if (this.isMonster()) {
      return `UserInput(type=monster, ${this.getMonsterId()})`;
    }
    if (this.isTerrain()) {
      return `UserInput(type=terrain, ${this.getPosition()})`;
    }
    return "UNKNOWN";
  }
}
