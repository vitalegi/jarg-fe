import BattlePhase from "@/game-engine/game-phase/BattlePhase";
import GameOverPhase from "@/game-engine/game-phase/GameOverPhase";
import HomePhase from "@/game-engine/game-phase/HomePhase";
import LoadGamePhase from "@/game-engine/game-phase/LoadGamePhase";
import NewGamePhase from "@/game-engine/game-phase/NewGamePhase";
import SelectNextBattlePhase from "@/game-engine/game-phase/SelectNextBattlePhase";
import TowerModeEntryPhase from "@/game-engine/game-phase/TowerModeEntryPhase";
import GameLoop from "@/game-engine/GameLoop";
import MapContainer from "@/game-engine/model/map/MapContainer";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";

@Service()
export default class PhaseService {
  protected logger = LoggerFactory.getLogger(
    "GameEngine.GamePhase.PhaseService"
  );
  protected gameLoop = Container.get(GameLoop);

  public async goToHome(): Promise<void> {
    await Container.get(HomePhase).start();
  }
  public async goToBattle(
    map: MapContainer,
    id: string,
    onWin: () => Promise<void>,
    onLoss: () => Promise<void>
  ): Promise<void> {
    await Container.get(BattlePhase).start({
      map: map,
      id: id,
      onWin: onWin,
      onLoss: onLoss,
    });
  }
  public async goToSelectNextBattle(): Promise<void> {
    await Container.get(SelectNextBattlePhase).start();
  }
  public async goToNewGame(): Promise<void> {
    await Container.get(NewGamePhase).start();
  }
  public async goToLoadGame(): Promise<void> {
    await Container.get(LoadGamePhase).start();
  }
  public async goToGameOver(): Promise<void> {
    await Container.get(GameOverPhase).start();
  }
  public async goToTowerMode(): Promise<void> {
    await Container.get(TowerModeEntryPhase).start();
  }
}
