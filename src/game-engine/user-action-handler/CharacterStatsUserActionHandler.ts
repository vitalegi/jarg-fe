import GameService from "@/services/GameService";
import Container from "typedi";
import MonsterIndexRepository from "../repositories/MonsterIndexRepository";
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
      const monsterIndexRepository = Container.get<MonsterIndexRepository>(
        MonsterIndexRepository
      );
      const monster = gameService.getMonsterById(input.getMonsterId());
      const monsterIndex = monsterIndexRepository.getMonster(monster.modelId);

      gameService.addGameLoopHandler(
        new MonsterInfoDrawer(gameService.getApp().stage, monster, monsterIndex)
      );
    }
  }
}
