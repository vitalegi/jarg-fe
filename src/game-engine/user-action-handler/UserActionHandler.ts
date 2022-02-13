import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import UserInput from "@/game-engine/user-action-handler/UserInput";
import Point from "@/models/Point";
import UuidUtil from "@/utils/UuidUtil";
import Container from "typedi";

export default abstract class UserActionHandler {
  private _uuid = UuidUtil.nextId();

  private resolve: null | ((point: UserInput) => void) = null;
  private reject: null | ((cause: unknown) => void) = null;

  execute(): Promise<UserInput> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  protected done(target: UserInput): void {
    if (this.resolve) {
      this.resolve(target);
    }
    this.removeHandler();
  }

  public getUuid(): string {
    return this._uuid;
  }

  public acceptTap(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processTap(input: UserInput): void {
    return;
  }

  public acceptDrag(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processDragStart(input: UserInput, newPosition: Point): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processDragMove(input: UserInput, newPosition: Point): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processDragEnd(input: UserInput, newPosition: Point): void {
    return;
  }

  protected fail(cause: unknown): void {
    if (this.reject) {
      this.reject(cause);
    }
    this.removeHandler();
  }

  private removeHandler(): void {
    const userActionService =
      Container.get<UserActionService>(UserActionService);
    userActionService.removeActionHandler(this);
  }

  public abstract getName(): string;
}
