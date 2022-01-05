import MonsterIndex from "@/models/MonsterIndex";
import Container, { Service } from "typedi";
import MonsterIndexService from "../monster/MonsterIndexService";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import HomePhase from "./HomePhase";

const starters = ["001", "004", "007"];

@Service()
export default class NewGamePhase extends AbstractPhase<never> {
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);

  public getName(): string {
    return "NewGamePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();
    const menu = new LeftMenu();
    for (const starter of starters) {
      menu.addEntry(this.starterEntry(starter));
    }
    menu.draw();
  }

  protected starterEntry(monsterId: string): MenuEntry {
    const monster = this.monsterIndexService.getMonster(monsterId);

    return new MenuEntry(
      monster.name,
      () => this.choose(monster),
      () => true
    );
  }

  protected async choose(monster: MonsterIndex): Promise<void> {
    console.log(`Chosen: ${monster.monsterId} - ${monster.name}`);
  }

  protected async goToHomePhase(): Promise<void> {
    await Container.get<HomePhase>(HomePhase).start();
  }
}
