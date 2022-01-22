export default abstract class Duration {
  type;

  public constructor(type: string) {
    this.type = type;
  }
  public abstract clone(): Duration;
  public abstract toJson(): any;
  public abstract create(): Duration;
  public abstract nextTurn(): void;
  public abstract isCompleted(): boolean;
  public abstract validate(): void;
}
