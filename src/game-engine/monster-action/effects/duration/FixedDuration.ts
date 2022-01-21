import Duration from "./Duration";

export class FixedDuration extends Duration {
  public static TYPE = "FIXED";
  end = 0;
  counter = 0;

  public constructor(end: number, counter = 0) {
    super(FixedDuration.TYPE);
    this.end = end;
    this.counter = counter;
  }

  public static fromJson(json: any): Duration {
    return new FixedDuration(json.end, 0);
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
}
