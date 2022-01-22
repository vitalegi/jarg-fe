import GameLoop from "@/game-engine/GameLoop";
import Monster from "@/game-engine/monster/Monster";
import HealthBarUpdateDrawer from "@/game-engine/ui/HealthBarUpdateDrawer";
import TextOverCharacterDrawer from "@/game-engine/ui/TextOverCharacterDrawer";
import Container from "typedi";
import Duration from "../effects/duration/Duration";

export default abstract class ComputedEffect {
  type;
  duration;

  public constructor(type: string, duration: Duration) {
    this.type = type;
    this.duration = duration;
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

  protected async safeUpdateHealth(
    monster: Monster,
    variation: number
  ): Promise<void> {
    return HealthBarUpdateDrawer.changeHealth(
      monster,
      monster.stats.hp,
      this.getHealthChange(monster, variation)
    );
  }

  protected getHealthChange(monster: Monster, variation: number): number {
    const newValue = monster.stats.hp + variation;
    if (newValue < 0) {
      return 0;
    }
    if (newValue > monster.stats.maxHP) {
      return monster.stats.maxHP;
    }
    return newValue;
  }

  protected formatNumber(value: number): string {
    if (value < 0) {
      return this.formatNumber(-value);
    }
    if (value < 1000) {
      return `${value}`;
    }
    if (value < 1000000) {
      const n = Math.floor(value / 1000);
      const m = Math.floor((value - n * 1000) / 100);
      return `${n}.${m}k`;
    }
    return `${value}`;
  }
}
