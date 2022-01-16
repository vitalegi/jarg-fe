import UserActionHandler from "./UserActionHandler";
import UserInput from "./UserInput";

export default class TapAnythingUserActionHandler extends UserActionHandler {
  public getName(): string {
    return "TapAnythingUserActionHandler";
  }

  public acceptTap(): boolean {
    return true;
  }

  public processTap(input: UserInput): void {
    this.done(input);
  }
}
