import Container from "typedi";
import GameApp from "../GameApp";
import GameLoop from "../GameLoop";
import MapRepository from "../map/MapRepository";
import MonsterIndexRepository from "../repositories/MonsterIndexRepository";
import MonsterInfoDrawer from "../ui/MonsterInfoDrawer";
import UserActionHandler from "./UserActionHandler";
import UserInput from "./UserInput";

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
