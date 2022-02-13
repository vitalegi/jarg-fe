import Duration from "@/game-engine/ability/effects/duration/Duration";
import { asInt } from "@/utils/JsonUtil";

export class FixedDuration extends Duration {
  public static TYPE = "FIXED";
  end;
  counter;

  public constructor(end: number, counter = 0) {
    super(FixedDuration.TYPE);
    this.end = end;
    this.counter = counter;
  }

  public static fromJson(json: any): Duration {
    return new FixedDuration(asInt(json.end), 0);
  }
  public clone(): Duration {
    return new FixedDuration(this.end, this.counter);
  }
  public toJson(): any {
    return new FixedDuration(this.end, this.counter);
  }

  public create(): Duration {
    return new FixedDuration(this.end, 0);
  }

  public nextTurn(): void {
    this.counter++;
  }
  public isCompleted(): boolean {
    return this.counter >= this.end;
  }
  public validate(): void {
    if (this.end <= 0) {
      throw Error(`Duration must be >= 1`);
    }
  }
}
