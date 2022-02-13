import AbstractPhase from "@/game-engine/game-phase/AbstractPhase";
import PhaseService from "@/game-engine/game-phase/PhaseService";
import SelectNextBattlePhase from "@/game-engine/game-phase/SelectNextBattlePhase";
import GameLoop from "@/game-engine/GameLoop";
import PlayerData from "@/game-engine/model/player-data/PlayerData";
import PlayerRepository from "@/game-engine/repositories/PlayerRepository";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import GameAssetService from "@/services/GameAssetService";
import { gameLabel } from "@/services/LocalizationService";
import Container, { Service } from "typedi";

@Service()
export default class LoadGamePhase extends AbstractPhase<never> {
  protected playerRepository = Container.get(PlayerRepository);
  protected gameAssetService = Container.get(GameAssetService);
  protected selectNextBattlePhase = Container.get(SelectNextBattlePhase);
  protected phaseService = Container.get(PhaseService);
  protected gameLoop = Container.get(GameLoop);

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
    this.getApp().ticker.add(() => this.gameLoop.gameLoop());
  }

  protected cancelEntry(): MenuEntry {
    return new MenuEntry(
      gameLabel("cancel"),
      () => this.phaseService.goToHome(),
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
    this.phaseService.goToSelectNextBattle();
  }
}
