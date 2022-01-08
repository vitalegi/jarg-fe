import Container, { Service } from "typedi";
import PlayerRepository from "../repositories/PlayerRepository";
import AbstractPhase from "./AbstractPhase";
import AbilityNameDrawer from "@/game-engine/ui/AbilityNameDrawer";
import GameLoop from "../GameLoop";
import HomePhase from "./HomePhase";

@Service()
export default class SelectNextBattlePhase extends AbstractPhase<never> {
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);
  protected gameLoop = Container.get<GameLoop>(GameLoop);

  public getName(): string {
    return "GameOverPhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    const message = new AbilityNameDrawer("Game Over");
    this.gameLoop.addGameLoopHandler(message);
    await message.notifyWhenCompleted();
    this.goToHomePhase();
  }

  protected async goToHomePhase(): Promise<void> {
    await Container.get<HomePhase>(HomePhase).start();
  }
}
