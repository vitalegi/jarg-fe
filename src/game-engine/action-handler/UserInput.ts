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
    return this.type === "monster";
  }
  public isTerrain(): boolean {
    return this.type === "terrain";
  }
}
