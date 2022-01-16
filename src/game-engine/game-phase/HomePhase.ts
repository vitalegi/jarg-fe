import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import PhaseService from "./PhaseService";

@Service()
export default class HomePhase extends AbstractPhase<never> {
  logger = LoggerFactory.getLogger("GameEngine.GamePhase.HomePhse");
  protected phaseService = Container.get<PhaseService>(PhaseService);

  public getName(): string {
    return "HomePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();

    const menu = new LeftMenu();
    menu.addEntry(this.newGameEntry());
    menu.addEntry(this.loadGameEntry());
    menu.draw();
  }

  protected newGameEntry(): MenuEntry {
    return new MenuEntry(
      "New Game",
      () => {
        this.phaseService.goToNewGame();
      },
      () => true
    );
  }
  protected loadGameEntry(): MenuEntry {
    return new MenuEntry(
      "Load Game",
      () => {
        this.phaseService.goToLoadGame();
      },
      () => true
    );
  }
}
