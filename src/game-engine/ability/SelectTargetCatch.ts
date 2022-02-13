import GameLoop from "@/game-engine/GameLoop";
import MapRepository from "@/game-engine/map/MapRepository";
import { CanTraverseAbility } from "@/game-engine/map/traversal/CanTraverse";
import GraphBuilder from "@/game-engine/map/traversal/GraphBuilder";
import MapTraversal from "@/game-engine/map/traversal/MapTraversal";
import Monster from "@/game-engine/model/monster/Monster";
import MonsterService from "@/game-engine/monster/MonsterService";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import TileFocusableDrawer from "@/game-engine/ui/TileFocusableDrawer";
import SelectTargetUserActionHandler from "@/game-engine/user-action-handler/SelectTargetUserActionHandler";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import Container from "typedi";

export default class SelectTargetCatch {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.SelectTargetCatch"
  );
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);

  public async selectTarget(
    source: Monster,
    range: number
  ): Promise<string | null> {
    const actionHandler = this.targetHandler(source, range);
    const acceptableTiles = actionHandler.getAcceptableTiles();
    const drawer = new TileFocusableDrawer(acceptableTiles);
    this.gameLoop.addGameLoopHandler(drawer);

    this.userActionService.addActionHandler(actionHandler);

    const menu = new LeftMenu();
    menu.addEntry(MenuEntry.alwaysEnabled(gameLabel("catch")));
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

  protected cancelOption(menu: LeftMenu): Promise<null> {
    return new Promise<null>((resolve) => {
      menu.addEntry(
        new MenuEntry(
          gameLabel("cancel"),
          () => resolve(null),
          () => true
        )
      );
    });
  }

  protected targetHandler(
    source: Monster,
    maxRange: number
  ): SelectTargetUserActionHandler {
    const mapTraversal = new MapTraversal(
      this.mapRepository.getMap(),
      source,
      new GraphBuilder(new CanTraverseAbility())
    );
    const acceptablePoints = mapTraversal
      .getPoints(maxRange)
      .map((p) => p.point);
    const allies = this.mapRepository.getAllies(source).map((m) => m.uuid);
    return new SelectTargetUserActionHandler(
      allies,
      false,
      true,
      acceptablePoints
    );
  }
}
