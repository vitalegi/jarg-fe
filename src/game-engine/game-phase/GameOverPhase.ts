import Container, { Service } from "typedi";
import AbilityNameDrawer from "@/game-engine/ui/AbilityNameDrawer";
import AbstractPhase from "@/game-engine/game-phase/AbstractPhase";
import PlayerRepository from "@/game-engine/repositories/PlayerRepository";
import GameLoop from "@/game-engine/GameLoop";
import PhaseService from "@/game-engine/game-phase/PhaseService";

@Service()
export default class GameOverPhase extends AbstractPhase<never> {
  protected playerRepository = Container.get(PlayerRepository);
  protected gameLoop = Container.get(GameLoop);
  protected phaseService = Container.get(PhaseService);

  public getName(): string {
    return "GameOverPhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    this.getApp().ticker.add(() => this.gameLoop.gameLoop());
    const message = new AbilityNameDrawer("Game Over");
    this.gameLoop.addGameLoopHandler(message);
    await message.notifyWhenCompleted();
    this.phaseService.goToHome();
  }
}
