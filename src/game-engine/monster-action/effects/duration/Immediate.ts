import Duration from "./Duration";

export class Immediate extends Duration {
  public static TYPE = "IMMEDIATE";

  public constructor() {
    super(Immediate.TYPE);
  }
  public static fromJson(json: any): Duration {
    return new Immediate();
  }
  public clone(): Duration {
    return new Immediate();
  }
  public toJson(): any {
    return new Immediate();
  }
  public create(): Duration {
    return new Immediate();
  }
  public nextTurn(): void {
    return;
  }
  public isCompleted(): boolean {
    return true;
  }
}
