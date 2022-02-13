import GameLoop from "@/game-engine/GameLoop";
import Drawer from "@/game-engine/ui/Drawer";
import SquaredTransitionDrawer from "@/game-engine/ui/scene-transition/SquaredTransitionDrawer";
import Container, { Service } from "typedi";

type Transition = "squared";

@Service()
export default class TransitionFactory {
  protected gameLoop = Container.get(GameLoop);

  public async transition(name: Transition): Promise<void> {
    const drawer = this.getTransition(name);
    this.gameLoop.addGameLoopHandler(drawer);
    await drawer.notifyWhenCompleted();
  }

  protected getTransition(name: Transition): Drawer {
    if (name === "squared") {
      return new SquaredTransitionDrawer();
    }
    throw Error(`Unknown transition ${name}`);
  }
}
