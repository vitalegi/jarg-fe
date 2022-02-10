import { asBoolean, asInt } from "@/utils/JsonUtil";

export default class Move {
  steps = 0;

  canWalk = false;
  canFly = false;

  public static fromJson(data: any): Move {
    const out = new Move();
    if (!data) {
      return out;
    }
    out.steps = asInt(data.steps);
    out.canWalk = asBoolean(data.canWalk, false);
    out.canFly = asBoolean(data.canFly, false);
    return out;
  }
}
