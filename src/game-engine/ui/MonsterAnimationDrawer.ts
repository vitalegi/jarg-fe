import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import TimeUtil from "@/utils/TimeUtil";
import { Animation } from "@/models/Animation";
import MonsterIndex from "../monster/MonsterIndex";

class MonsterSprite {
  monsterId;
  animation;
  sprite;
  lastUpdate: number = TimeUtil.timestamp();
  currIndex = 0;

  public constructor(
    monsterId: string,
    animation: Animation,
    sprite: PIXI.AnimatedSprite
  ) {
    this.monsterId = monsterId;
    this.animation = animation;
    this.sprite = sprite;
  }
}

export default class MonsterAnimationDrawer extends Drawer {
  public static NAME = "MonsterAnimationDrawer";
  protected monsters: MonsterSprite[] = [];

  public constructor() {
    super();
  }

  public getName(): string {
    return MonsterAnimationDrawer.NAME;
  }

  public addMonster(
    monsterId: string,
    monsterIndex: MonsterIndex,
    sprite: PIXI.AnimatedSprite,
    key: string
  ): void {
    const animationSpecs = monsterIndex.animations.filter(
      (a) => a.key === key
    )[0];
    this.monsters.push(new MonsterSprite(monsterId, animationSpecs, sprite));
  }

  public removeMonster(monsterId: string): void {
    this.monsters = this.monsters.filter((m) => m.monsterId !== monsterId);
  }

  protected doDraw(): void {
    const timestamp = TimeUtil.timestamp();
    this.monsters.forEach((m) => this.update(timestamp, m));
  }

  protected update(timestamp: number, entry: MonsterSprite): void {
    const frame = entry.animation.frames[entry.currIndex];
    if (timestamp - entry.lastUpdate > frame.duration) {
      entry.lastUpdate = timestamp;
      const next = (entry.currIndex + 1) % entry.animation.frames.length;
      entry.currIndex = next;
      entry.sprite.gotoAndStop(next);
    }
  }
}
