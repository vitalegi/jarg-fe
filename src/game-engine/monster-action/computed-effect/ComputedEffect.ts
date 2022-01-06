import GameLoop from "@/game-engine/GameLoop";
import Monster from "@/game-engine/monster/Monster";
import TextOverCharacterDrawer from "@/game-engine/ui/TextOverCharacterDrawer";
import Container from "typedi";

export default abstract class ComputedEffect {
  abstract hasEffectOn(monster: Monster): boolean;

  public applyBeforeRender(): void {
    return;
  }
  public async render(): Promise<void> {
    return;
  }
  public applyAfterRender(): void {
    return;
  }

  protected async showTextOverMonster(
    monster: Monster,
    text: string
  ): Promise<void> {
    const drawer = new TextOverCharacterDrawer(monster, text);
    this.getGameLoop().addGameLoopHandler(drawer);
    return drawer.notifyWhenCompleted();
  }

  protected getGameLoop(): GameLoop {
    return Container.get<GameLoop>(GameLoop);
  }
}
