import Point from "@/models/Point";
import UserActionService from "@/services/UserActionService";
import Container from "typedi";
import UserInput from "./UserInput";

export default abstract class UserActionHandler {
  private resolve: null | ((point: UserInput) => void) = null;
  private reject: null | ((cause: unknown) => void) = null;

  execute(): Promise<UserInput> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public abstract process(input: UserInput): void;

  protected done(target: UserInput): void {
    if (this.resolve) {
      this.resolve(target);
    }
    this.removeHandler();
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
    userActionService.setActionHandler(null);
  }
}
