import AbstractPhase from "@/game-engine/game-phase/AbstractPhase";
import PhaseService from "@/game-engine/game-phase/PhaseService";
import GameLoop from "@/game-engine/GameLoop";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import Container, { Service } from "typedi";

@Service()
export default class HomePhase extends AbstractPhase<never> {
  logger = LoggerFactory.getLogger("GameEngine.GamePhase.HomePhse");
  protected phaseService = Container.get(PhaseService);
  protected gameLoop = Container.get(GameLoop);

  public getName(): string {
    return "HomePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    // initialize all common resources at once
    await Promise.all([
      this.getGameAppDataLoader().loadAbilities(),
      this.getGameAppDataLoader().loadTypes(),
      this.getGameAppDataLoader().loadMonsters(),
      this.getGameAppDataLoader().loadMaps(),
    ]);

    const menu = new LeftMenu();
    menu.addEntry(this.newGameEntry());
    menu.addEntry(this.loadGameEntry());
    menu.draw();
    this.getApp().ticker.add(() => this.gameLoop.gameLoop());
  }

  protected newGameEntry(): MenuEntry {
    return new MenuEntry(
      gameLabel("new-game"),
      () => {
        this.phaseService.goToNewGame();
      },
      () => true
    );
  }
  protected loadGameEntry(): MenuEntry {
    return new MenuEntry(
      gameLabel("load-game"),
      () => {
        this.phaseService.goToLoadGame();
      },
      () => true
    );
  }
}
