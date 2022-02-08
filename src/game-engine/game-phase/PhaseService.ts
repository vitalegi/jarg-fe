import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";
import GameLoop from "../GameLoop";
import MapContainer from "../map/MapContainer";
import SquaredTransitionDrawer from "../ui/scene-transition/SquaredTransitionDrawer";
import BattlePhase from "./BattlePhase";
import GameOverPhase from "./GameOverPhase";
import HomePhase from "./HomePhase";
import LoadGamePhase from "./LoadGamePhase";
import NewGamePhase from "./NewGamePhase";
import SelectNextBattlePhase from "./SelectNextBattlePhase";
import TowerModeEntryPhase from "./TowerModeEntryPhase";

@Service()
export default class PhaseService {
  protected logger = LoggerFactory.getLogger(
    "GameEngine.GamePhase.PhaseService"
  );
  protected gameLoop = Container.get<GameLoop>(GameLoop);

  public async goToHome(): Promise<void> {
    await Container.get<HomePhase>(HomePhase).start();
  }
  public async goToBattle(map: MapContainer): Promise<void> {
    await this.transition();
    await Container.get<BattlePhase>(BattlePhase).start(map);
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
