import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import Monster from "@/game-engine/monster/Monster";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import Container, { Service } from "typedi";
import Ability from "../Ability";
import SelectTargetUserActionHandler from "@/game-engine/user-action-handler/SelectTargetUserActionHandler";
import UserInput from "@/game-engine/user-action-handler/UserInput";
import AbilityExecutor from "../AbilityExecutor";
import Point from "@/models/Point";
import MapTraversal from "@/game-engine/MapTraversal";
import MonsterMove from "../MonsterMove";
import MonsterService from "@/game-engine/monster/MonsterService";
import MapRepository from "@/game-engine/map/MapRepository";
import BattleService from "@/game-engine/battle/BattleService";

@Service()
export default class MonsterActionMenuBuilder {
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);

  public build(monster: Monster): LeftMenu {
    const leftMenu = new LeftMenu();
    leftMenu.addEntry(this.move(leftMenu, monster));
    monster.abilities
      .map((ability) => this.abilityMenuEntry(leftMenu, monster, ability))
      .forEach((m) => leftMenu.addEntry(m));
    leftMenu.addEntry(this.endTurn());
    return leftMenu;
  }

  protected move(leftMenu: LeftMenu, monster: Monster): MenuEntry {
    return new MenuEntry(
      "Move",
      () => {
        leftMenu.hide();
        this.selectWalkTarget(monster).then((path: Point[]) => {
          new MonsterMove(monster, path).execute().then(() => {
            console.log(`Walk to ${path[path.length - 1]} is completed.`);
            leftMenu.reDraw();
            leftMenu.show();
          });
        });
      },
      () => this.monsterService.canActiveMonsterMove()
    );
  }

  protected endTurn(): MenuEntry {
    return new MenuEntry(
      "End Turn",
      () => this.nextTurn(),
      () => true
    );
  }

  protected abilityMenuEntry(
    leftMenu: LeftMenu,
    monster: Monster,
    ability: Ability
  ): MenuEntry {
    return new MenuEntry(
      ability.label,
      () => {
        leftMenu.hide();
        this.selectTargetMonster(monster.uuid).then((target: Monster) => {
          console.log(
            `Selected target of ability ${ability.label}: ${target.uuid} / ${target.coordinates}`
          );
          const executor = new AbilityExecutor(monster, target, ability);
          executor.execute().then(() => {
            console.log(`User ability ${ability.label} is completed.`);
            leftMenu.reDraw();
          });
        });
      },
      () => {
        if (!this.monsterService.canActiveMonsterUseAbility()) {
          console.log(`Ability slots already consumed for this turn`);
          return false;
        }
        if (!(ability.usages.current > 0)) {
          console.log(`No more ability usages for ${ability.label}`);
          return false;
        }
        console.log(`Ability ${ability.label} is enabled`);
        return true;
      }
    );
  }

  protected async selectTargetMonster(skipUUID: string): Promise<Monster> {
    const target = await this.selectTarget(skipUUID, false, true);
    console.log(`Selected target ${target}`);
    return this.mapRepository.getMonsterById(target.getMonsterId());
  }

  protected async selectWalkTarget(monster: Monster): Promise<Point[]> {
    let path: Point[] = [];

    let found = false;
    do {
      const target = await this.selectTarget(null, true, false);

      try {
        path = new MapTraversal(this.mapRepository.getMap(), monster).getPath(
          target.getPosition()
        );
        const maxDistance = this.monsterService.availableActiveMonsterMoves();
        if (path.length - 1 > maxDistance) {
          throw Error(
            `Monster can walk only ${maxDistance}, ${path.length - 1} selected.`
          );
        }
        console.log(`Selected target ${target}`);
        found = true;
      } catch (e) {
        console.error(
          `Failed to find a path between ${monster.coordinates} (${monster.uuid}) and ${target}`,
          e
        );
      }
    } while (!found);
    return path;
  }

  protected async selectTarget(
    skipUUID: string | null,
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

    userActionService.addActionHandler(actionHandler);
    return await actionHandler.execute();
  }

  protected nextTurn(): void {
    Container.get<BattleService>(BattleService).nextTurn();
  }
}
