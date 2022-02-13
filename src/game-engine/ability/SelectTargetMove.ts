import Point from "@/models/Point";
import Container from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import MonsterService from "@/game-engine/monster/MonsterService";
import MapRepository from "@/game-engine/map/MapRepository";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import GameLoop from "@/game-engine/GameLoop";
import Monster from "@/game-engine/model/monster/Monster";
import SelectTargetUserActionHandler from "@/game-engine/user-action-handler/SelectTargetUserActionHandler";
import TileFocusableDrawer from "@/game-engine/ui/TileFocusableDrawer";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import MapTraversal from "@/game-engine/map/traversal/MapTraversal";
import GraphBuilder from "@/game-engine/map/traversal/GraphBuilder";
import { CanTraverseWalking } from "@/game-engine/map/traversal/CanTraverse";

export default class SelectTargetMove {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.SelectTargetMove");
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);

  // TODO refactor, too much complexity unused. Also, merge select target/select move/select catch
  targetHandlerProvider: (monster: Monster) => SelectTargetUserActionHandler = (
    monster: Monster
  ) => this.selectWalkTargetHandler(monster);

  public async selectTarget(monster: Monster): Promise<Point[] | null> {
    const actionHandler = this.targetHandlerProvider(monster);
    const acceptableTiles = actionHandler.getAcceptableTiles();
    const drawer = new TileFocusableDrawer(acceptableTiles);
    this.gameLoop.addGameLoopHandler(drawer);

    this.userActionService.addActionHandler(actionHandler);

    const menu = new LeftMenu();
    menu.addEntry(MenuEntry.alwaysEnabled("Move"));
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
          gameLabel("cancel"),
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
    const acceptablePoints = mapTraversal
      .getPoints(maxDistance)
      .map((p) => p.point);

    return new SelectTargetUserActionHandler(
      null,
      true,
      false,
      acceptablePoints
    );
  }
}
