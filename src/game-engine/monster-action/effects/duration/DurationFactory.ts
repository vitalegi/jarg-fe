import Duration from "./Duration";
import { FixedDuration } from "./FixedDuration";
import { Immediate } from "./Immediate";
import { RandomDuration } from "./RandomDuration";

export default class DurationFactory {
  public static fromJson(json: any): Duration {
    if (json.type === Immediate.TYPE) {
      return Immediate.fromJson(json);
    }
    if (json.type === FixedDuration.TYPE) {
      return FixedDuration.fromJson(json);
    }
    if (json.type === RandomDuration.TYPE) {
      return RandomDuration.fromJson(json);
    }
    throw Error(
      `Type ${json.type} is not a valid duration. ${JSON.stringify(json)}`
    );
  }
}
