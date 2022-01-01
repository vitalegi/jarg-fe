import Point from "@/models/Point";
import GameService from "@/services/GameService";
import Container from "typedi";
import MonsterInfoDrawer from "../ui/MonsterInfoDrawer";
import UserActionHandler from "./UserActionHandler";
import UserInput from "./UserInput";

export default class CharacterStatsUserActionHandler extends UserActionHandler {
  public getName(): string {
    return "CharacterStatsUserActionHandler";
  }

  public acceptTap(): boolean {
    return true;
  }

  public processTap(input: UserInput): void {
    if (input.isMonster()) {
      const gameService = Container.get<GameService>(GameService);
      gameService.addGameLoopHandler(
        new MonsterInfoDrawer(
          gameService.getApp().stage,
          gameService.getMonsterById(input.getMonsterId())
        )
      );
    }
  }
}
