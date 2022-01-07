import Point from "@/models/Point";
import Container from "typedi";
import MapRepository from "../map/MapRepository";
import { CanTraverseWalking } from "../map/traversal/CanTraverse";
import GraphBuilder from "../map/traversal/GraphBuilder";
import MapTraversal from "../map/traversal/MapTraversal";
import Monster from "../monster/Monster";
import MonsterService from "../monster/MonsterService";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import SelectTargetUserActionHandler from "../user-action-handler/SelectTargetUserActionHandler";
import UserActionService from "../user-action-handler/UserActionService";

export default class SelectTargetMove {
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);

  targetHandlerProvider: (monster: Monster) => SelectTargetUserActionHandler = (
    monster: Monster
  ) => this.selectWalkTargetHandler(monster);

  public async selectTarget(monster: Monster): Promise<Point[] | null> {
    const actionHandler = this.targetHandlerProvider(monster);

    this.userActionService.addActionHandler(actionHandler);

    const menu = new LeftMenu();
    menu.addEntry(MenuEntry.alwaysEnabled("Move"));
    const cancelPromise = this.cancelOption(menu);
    menu.draw();

    const targetPromise = actionHandler.execute();

    const result = await Promise.any([cancelPromise, targetPromise]);
    menu.destroy();
    if (!result) {
      console.log("Action is dismissed");
      return null;
    }
    const mapTraversal = new MapTraversal(
      this.mapRepository.getMap(),
      monster,
      new GraphBuilder(new CanTraverseWalking())
    );
    const path = mapTraversal.getPath(result.getPosition());
    return path;
  }

  public setTargetHandlerProvider(
    provider: (monster: Monster) => SelectTargetUserActionHandler
  ): void {
    this.targetHandlerProvider = provider;
  }

  protected cancelOption(menu: LeftMenu): Promise<null> {
    return new Promise<null>((resolve) => {
      menu.addEntry(
        new MenuEntry(
          "Cancel",
          () => resolve(null),
          () => true
        )
      );
    });
  }

  protected selectWalkTargetHandler(
    monster: Monster
  ): SelectTargetUserActionHandler {
    const mapTraversal = new MapTraversal(
      this.mapRepository.getMap(),
      monster,
      new GraphBuilder(new CanTraverseWalking())
    );
    const maxDistance = this.monsterService.availableActiveMonsterMoves();
    const acceptablePoints = mapTraversal.getPoints(maxDistance);

    return new SelectTargetUserActionHandler(
      null,
      true,
      false,
      acceptablePoints
    );
  }
}
