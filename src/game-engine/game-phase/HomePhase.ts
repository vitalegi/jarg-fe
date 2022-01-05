import Container, { Service } from "typedi";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import NewGamePhase from "./NewGamePhase";

@Service()
export default class HomePhase extends AbstractPhase<never> {
  public getName(): string {
    return "HomePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();

    const menu = new LeftMenu();
    menu.addEntry(this.newGameEntry());
    menu.draw();
  }

  protected newGameEntry(): MenuEntry {
    return new MenuEntry(
      "New Game",
      () => {
        console.log("New Game");
        this.goToNewGamePhase();
      },
      () => true
    );
  }
  protected async goToNewGamePhase(): Promise<void> {
    await Container.get<NewGamePhase>(NewGamePhase).start();
  }
}
