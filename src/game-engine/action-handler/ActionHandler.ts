import UserActionService from "@/services/UserActionService";
import Container from "typedi";
import UserInput from "./UserInput";

export default abstract class ActionHandler {
  abstract start(input: UserInput): void;
  abstract process(input: UserInput): void;
  abstract isCompleted(): boolean;

  protected removeHandler(): void {
    const userActionService =
      Container.get<UserActionService>(UserActionService);
    userActionService.setActionHandler(null);
  }
}
