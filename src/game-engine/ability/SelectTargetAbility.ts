import GameLoop from "@/game-engine/GameLoop";
import MapRepository from "@/game-engine/map/MapRepository";
import { CanTraverseAbility } from "@/game-engine/map/traversal/CanTraverse";
import GraphBuilder from "@/game-engine/map/traversal/GraphBuilder";
import MapTraversal from "@/game-engine/map/traversal/MapTraversal";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";
import MonsterService from "@/game-engine/monster/MonsterService";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import TileFocusableDrawer from "@/game-engine/ui/TileFocusableDrawer";
import SelectTargetUserActionHandler from "@/game-engine/user-action-handler/SelectTargetUserActionHandler";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import Container from "typedi";

export default class SelectTargetAbility {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.SelectTargetAbility"
  );
  protected monsterService = Container.get(MonsterService);
  protected mapRepository = Container.get(MapRepository);
  protected userActionService = Container.get(UserActionService);
  protected gameLoop = Container.get(GameLoop);

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
          gameLabel("cancel"),
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
