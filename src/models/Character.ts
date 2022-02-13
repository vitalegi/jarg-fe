import Move from "@/models/Move";
import Point from "@/models/Point";
import { asString } from "@/utils/JsonUtil";

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
    out.uuid = asString(data.uuid);
    out.name = asString(data.name);
    out.type = asString(data.type);
    out.modelId = asString(data.modelId);
    out.coordinates = Point.fromJson(data.coordinates);
    out.movements = Move.fromJson(data.movements);
    return out;
  }
}
