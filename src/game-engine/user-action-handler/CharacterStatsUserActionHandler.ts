import GameApp from "@/game-engine/GameApp";
import GameLoop from "@/game-engine/GameLoop";
import MapRepository from "@/game-engine/map/MapRepository";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";
import MonsterInfoDrawer from "@/game-engine/ui/MonsterInfoDrawer";
import UserActionHandler from "@/game-engine/user-action-handler/UserActionHandler";
import UserInput from "@/game-engine/user-action-handler/UserInput";
import Container from "typedi";

export default class CharacterStatsUserActionHandler extends UserActionHandler {
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected gameApp = Container.get<GameApp>(GameApp);
  protected mapRepository = Container.get<MapRepository>(MapRepository);

  public getName(): string {
    return "CharacterStatsUserActionHandler";
  }

  public acceptTap(): boolean {
    return true;
  }

  public processTap(input: UserInput): void {
    if (input.isMonster()) {
      const monsterIndexRepository = Container.get<MonsterIndexRepository>(
        MonsterIndexRepository
      );
      const monster = this.mapRepository.getMonsterById(input.getMonsterId());
      const monsterIndex = monsterIndexRepository.getMonster(monster.modelId);

      this.gameLoop.addGameLoopHandler(
        new MonsterInfoDrawer(
          this.gameApp.getApp().stage,
          monster,
          monsterIndex
        )
      );
    }
  }
}
