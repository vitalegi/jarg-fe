import Duration from "@/game-engine/ability/effects/duration/Duration";
import RandomService from "@/services/RandomService";
import { asDecimal } from "@/utils/JsonUtil";
import Container from "typedi";

export class RandomDuration extends Duration {
  public static TYPE = "RANDOM";

  threshold;
  exit;

  public constructor(threshold: number, exit = false) {
    super(RandomDuration.TYPE);
    this.threshold = threshold;
    this.exit = exit;
  }

  public static fromJson(json: any): Duration {
    return new RandomDuration(asDecimal(json.threshold), false);
  }
  public clone(): Duration {
    return new RandomDuration(this.threshold, this.exit);
  }
  public toJson(): any {
    return new RandomDuration(this.threshold, this.exit);
  }

  public create(): Duration {
    const duration = new RandomDuration(this.threshold, false);
    duration.threshold = this.threshold;
    return duration;
  }

  public nextTurn(): void {
    const randomService = Container.get<RandomService>(RandomService);
    if (!this.exit) {
      this.exit = randomService.randomBool(this.threshold);
    }
  }
  public isCompleted(): boolean {
    return this.exit;
  }
  public validate(): void {
    if (this.threshold < 0 || this.threshold > 1) {
      throw Error(
        `Threshold of random duration out of range: ${this.threshold * 100}`
      );
    }
  }
}
