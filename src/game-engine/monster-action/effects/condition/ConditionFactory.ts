import { asDecimal } from "@/utils/JsonUtil";
import Condition from "./Condition";
import HitCondition from "./HitCondition";
import RandomCondition from "./RandomCondition";

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
