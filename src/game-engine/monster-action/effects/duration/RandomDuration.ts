import RandomService from "@/services/RandomService";
import Container from "typedi";
import Duration from "./Duration";

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
    return new RandomDuration(json.threshold, false);
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
}
