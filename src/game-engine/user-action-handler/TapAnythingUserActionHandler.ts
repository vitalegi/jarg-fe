import UserActionHandler from "@/game-engine/user-action-handler/UserActionHandler";
import UserInput from "@/game-engine/user-action-handler/UserInput";

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
