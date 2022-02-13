import Condition from "@/game-engine/ability/effects/condition/Condition";
import HitCondition from "@/game-engine/ability/effects/condition/HitCondition";
import RandomCondition from "@/game-engine/ability/effects/condition/RandomCondition";
import { asDecimal } from "@/utils/JsonUtil";

export default class ConditionFactory {
  public static fromJson(json: any): Condition {
    if (json.type === HitCondition.KEY) {
      return new HitCondition();
    }
    if (json.type === RandomCondition.KEY) {
      return new RandomCondition(asDecimal(json.threshold));
    }
    throw Error(`Unknown condition ${JSON.stringify(json)}`);
  }
}
