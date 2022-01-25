import Move from "./Move";
import Point from "./Point";

export class CharacterType {
  public static MONSTER = "MONSTER";
  //public static HUMAN = "HUMAN";
}

export default class Character {
  uuid = "";
  name = "";
  type = CharacterType.MONSTER;
  modelId = "";
  coordinates: Point | null = null;
  movements = new Move();

  public static fromJsonCharacter(data: any, out: Character): Character {
    out.uuid = data.uuid;
    out.name = data.name;
    out.type = data.type;
    out.modelId = data.modelId;
    out.coordinates = Point.fromJson(data.coordinates);
    out.movements = Move.fromJson(data.movements);
    return out;
  }
}
