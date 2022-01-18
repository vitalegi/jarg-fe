import GameLoop from "@/game-engine/GameLoop";
import Monster from "@/game-engine/monster/Monster";
import TextOverCharacterDrawer from "@/game-engine/ui/TextOverCharacterDrawer";
import Container from "typedi";

export default abstract class ComputedEffect {
  type;

  public constructor(type: string) {
    this.type = type;
  }

  abstract hasEffectOn(monster: Monster): boolean;

  public async onHitBefore(): Promise<void> {
    return;
  }
  public async onHitRender(): Promise<void> {
    return;
  }
  public async onHitAfter(): Promise<void> {
    return;
  }
  public async turnStartBefore(): Promise<void> {
    return;
  }
  public async turnStartRender(): Promise<void> {
    return;
  }
  public async turnStartAfter(): Promise<void> {
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
