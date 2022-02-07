import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import Container, { Service } from "typedi";
import GameLoop from "../GameLoop";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import PhaseService from "./PhaseService";

@Service()
export default class HomePhase extends AbstractPhase<never> {
  logger = LoggerFactory.getLogger("GameEngine.GamePhase.HomePhse");
  protected phaseService = Container.get<PhaseService>(PhaseService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);

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
