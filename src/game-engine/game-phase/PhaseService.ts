import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";
import MapContainer from "../map/MapContainer";
import BattlePhase from "./BattlePhase";
import SelectNextBattlePhase from "./GameOverPhase";
import HomePhase from "./HomePhase";
import LoadGamePhase from "./LoadGamePhase";
import NewGamePhase from "./NewGamePhase";

@Service()
export default class PhaseService {
  protected logger = LoggerFactory.getLogger(
    "GameEngine.GamePhase.PhaseService"
  );

  public async goToHome(): Promise<void> {
    await Container.get<HomePhase>(HomePhase).start();
  }
  public async goToBattle(map: MapContainer): Promise<void> {
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
}
