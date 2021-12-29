import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import UserActionService from "@/services/UserActionService";
import Container, { Service } from "typedi";
import Ability from "../Ability";
import SelectTargetUserActionHandler from "@/game-engine/user-action-handler/SelectTargetUserActionHandler";
import UserInput from "@/game-engine/user-action-handler/UserInput";
import AbilityExecutor from "../AbilityExecutor";

@Service()
export default class MonsterActionMenuBuilder {
  public build(monster: Monster): LeftMenu {
    const leftMenu = new LeftMenu();
    leftMenu.addEntry(new MenuEntry("Move", () => console.log("move")));
    monster.abilities
      .map((ability) => this.abilityMenuEntry(monster, ability))
      .forEach((m) => leftMenu.addEntry(m));

    return leftMenu;
  }

  protected abilityMenuEntry(monster: Monster, ability: Ability): MenuEntry {
    return new MenuEntry(ability.label, () => {
      this.selectTargetMonster(monster.uuid).then((target: Monster) => {
        console.log(`Selected target of ability ${ability.label}: ${target}`);
        const executor = new AbilityExecutor(monster, target, ability);
        executor.execute().then(() => {
          console.log(
            `User ability ${ability.label} is completed, go to next turn.`
          );
          this.nextTurn();
        });
      });
    });
  }

  protected async selectTargetMonster(skipUUID: string): Promise<Monster> {
    const target = await this.selectTarget(skipUUID, false, true);
    console.log(`Selected target ${target}`);
    const gameService = Container.get<GameService>(GameService);
    return gameService.getMonsterById(target.getMonsterId());
  }

  protected async selectTarget(
    skipUUID: string,
    allowTerrains: boolean,
    allowMonsters: boolean
  ): Promise<UserInput> {
    console.log(
      `Expecting a target. Not [${skipUUID}], terrains: ${allowTerrains}, monsters: ${allowMonsters}`
    );
    const actionHandler = new SelectTargetUserActionHandler(
      skipUUID,
      allowTerrains,
      allowMonsters
    );
    const userActionService =
      Container.get<UserActionService>(UserActionService);
    userActionService.setActionHandler(actionHandler);
    return await actionHandler.execute();
  }

  protected nextTurn(): void {
    const gameService = Container.get<GameService>(GameService);
    gameService.nextTurn();
  }
}
