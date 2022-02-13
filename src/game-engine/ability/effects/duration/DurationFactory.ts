import Duration from "@/game-engine/ability/effects/duration/Duration";
import { FixedDuration } from "@/game-engine/ability/effects/duration/FixedDuration";
import { Immediate } from "@/game-engine/ability/effects/duration/Immediate";
import { RandomDuration } from "@/game-engine/ability/effects/duration/RandomDuration";

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
