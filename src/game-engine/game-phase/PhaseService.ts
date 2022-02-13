import BattlePhase from "@/game-engine/game-phase/BattlePhase";
import GameOverPhase from "@/game-engine/game-phase/GameOverPhase";
import HomePhase from "@/game-engine/game-phase/HomePhase";
import LoadGamePhase from "@/game-engine/game-phase/LoadGamePhase";
import NewGamePhase from "@/game-engine/game-phase/NewGamePhase";
import SelectNextBattlePhase from "@/game-engine/game-phase/SelectNextBattlePhase";
import TowerModeEntryPhase from "@/game-engine/game-phase/TowerModeEntryPhase";
import GameLoop from "@/game-engine/GameLoop";
import MapContainer from "@/game-engine/map/MapContainer";
import SquaredTransitionDrawer from "@/game-engine/ui/scene-transition/SquaredTransitionDrawer";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";

@Service()
export default class PhaseService {
  protected logger = LoggerFactory.getLogger(
    "GameEngine.GamePhase.PhaseService"
  );
  protected gameLoop = Container.get<GameLoop>(GameLoop);

  public async goToHome(): Promise<void> {
    await Container.get<HomePhase>(HomePhase).start();
  }
  public async goToBattle(
    map: MapContainer,
    id: string,
    onWin: () => Promise<void>,
    onLoss: () => Promise<void>
  ): Promise<void> {
    await this.transition();
    await Container.get<BattlePhase>(BattlePhase).start({
      map: map,
      id: id,
      onWin: onWin,
      onLoss: onLoss,
    });
  }
  public async goToSelectNextBattle(): Promise<void> {
    await Container.get<SelectNextBattlePhase>(SelectNextBattlePhase).start();
  }
  public async goToNewGame(): Promise<void> {
    await Container.get<NewGamePhase>(NewGamePhase).start();
  }
  public async goToLoadGame(): Promise<void> {
    await Container.get<LoadGamePhase>(LoadGamePhase).start();
  }
  public async goToGameOver(): Promise<void> {
    await Container.get<GameOverPhase>(GameOverPhase).start();
  }
  public async goToTowerMode(): Promise<void> {
    await Container.get<TowerModeEntryPhase>(TowerModeEntryPhase).start();
  }

  protected async transition(): Promise<void> {
    const drawer = new SquaredTransitionDrawer();
    this.gameLoop.addGameLoopHandler(drawer);
    await drawer.notifyWhenCompleted();
  }
}
