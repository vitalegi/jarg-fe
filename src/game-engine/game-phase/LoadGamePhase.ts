import GameAssetService from "@/services/GameAssetService";
import Container, { Service } from "typedi";
import PlayerData from "../PlayerData";
import PlayerRepository from "../repositories/PlayerRepository";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import HomePhase from "./HomePhase";
import SelectNextBattlePhase from "./SelectNextBattlePhase";

@Service()
export default class LoadGamePhase extends AbstractPhase<never> {
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected selectNextBattlePhase = Container.get<SelectNextBattlePhase>(
    SelectNextBattlePhase
  );

  public getName(): string {
    return "LoadGamePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();

    const menu = new LeftMenu();
    const playersData = this.playerRepository.loadAll();
    menu.addEntry(this.cancelEntry());
    for (const playerData of playersData) {
      menu.addEntry(this.loadEntry(playerData));
    }
    menu.draw();
  }

  protected cancelEntry(): MenuEntry {
    return new MenuEntry(
      "Cancel",
      () => this.goToHomePhase(),
      () => true
    );
  }
  protected loadEntry(playerData: PlayerData): MenuEntry {
    return new MenuEntry(
      playerData.playerId,
      () => this.choose(playerData),
      () => true
    );
  }

  protected async choose(playerData: PlayerData): Promise<void> {
    this.playerRepository.setPlayerData(playerData);
    this.goToSelectNextBattlePhase();
  }

  protected async goToSelectNextBattlePhase(): Promise<void> {
    await this.selectNextBattlePhase.start();
  }
  protected async goToHomePhase(): Promise<void> {
    await Container.get<HomePhase>(HomePhase).start();
  }
}
