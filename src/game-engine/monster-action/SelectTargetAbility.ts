import LoggerFactory from "@/logger/LoggerFactory";
import Container from "typedi";
import GameLoop from "../GameLoop";
import MapRepository from "../map/MapRepository";
import { CanTraverseAbility } from "../map/traversal/CanTraverse";
import GraphBuilder from "../map/traversal/GraphBuilder";
import MapTraversal from "../map/traversal/MapTraversal";
import Monster from "../monster/Monster";
import MonsterService from "../monster/MonsterService";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import TileFocusableDrawer from "../ui/TileFocusableDrawer";
import SelectTargetUserActionHandler from "../user-action-handler/SelectTargetUserActionHandler";
import UserActionService from "../user-action-handler/UserActionService";
import Ability from "./ability/Ability";

export default class SelectTargetAbility {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.SelectTargetAbility"
  );
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);

  targetHandlerProvider: (
    monster: Monster,
    ability: Ability
  ) => SelectTargetUserActionHandler = (monster: Monster, ability: Ability) =>
    this.selectAbilityTargetHandler(monster, ability);

  public async selectTarget(
    monster: Monster,
    ability: Ability
  ): Promise<string | null> {
    const actionHandler = this.targetHandlerProvider(monster, ability);
    const acceptableTiles = actionHandler.getAcceptableTiles();
    const drawer = new TileFocusableDrawer(acceptableTiles);
    this.gameLoop.addGameLoopHandler(drawer);

    this.userActionService.addActionHandler(actionHandler);

    const menu = new LeftMenu();
    menu.addEntry(MenuEntry.alwaysEnabled(ability.label));
    const cancelPromise = this.cancelOption(menu);
    menu.draw();

    const targetPromise = actionHandler.execute();

    const result = await Promise.any([cancelPromise, targetPromise]);
    menu.destroy();
    drawer.remove();
    if (this.userActionService.hasActionHandler(actionHandler)) {
      this.userActionService.removeActionHandler(actionHandler);
    }
    if (!result) {
      this.logger.info("Action is dismissed");
      return null;
    }
    return result.getMonsterId();
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

  protected selectAbilityTargetHandler(
    monster: Monster,
    ability: Ability
  ): SelectTargetUserActionHandler {
    const mapTraversal = new MapTraversal(
      this.mapRepository.getMap(),
      monster,
      new GraphBuilder(new CanTraverseAbility())
    );
    const maxDistance = ability.abilityTarget.range;
    const acceptablePoints = mapTraversal
      .getPoints(maxDistance)
      .map((p) => p.point);
    return new SelectTargetUserActionHandler(
      null,
      false,
      true,
      acceptablePoints
    );
  }
}
