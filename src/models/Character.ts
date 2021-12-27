import * as PIXI from "pixi.js";
import Point from "./Point";

export class CharacterType {
  public static MONSTER = "MONSTER";
  //public static HUMAN = "HUMAN";
}

export class Stats {
  hp = 0;
  atk = 0;
  def = 0;

  public static create(data: any): Stats {
    const out = new Stats();
    out.hp = data.hp;
    out.atk = data.atk;
    out.def = data.def;

    return out;
  }
}

export default class Character {
  uuid = "";
  name = "";
  type = CharacterType.MONSTER;
  modelId = "";
  sprite: PIXI.Sprite | null = null;
  coordinates: Point | null = null;

  public static create(data: any, out: Character): Character {
    out.uuid = data.uuid;
    out.name = data.name;
    out.type = data.type;
    out.modelId = data.modelId;
    out.sprite = data.sprite;
    out.coordinates = Point.create(data.coordinates);
    return out;
  }

  public getSprite(): PIXI.Sprite {
    if (this.sprite) {
      return this.sprite;
    }
    throw new Error("Sprite is null");
  }
}

export class Monster extends Character {
  ownerId: string | null = "";
  stats = new Stats();

  public static createMonster(monster: any): Monster {
    const out = new Monster();
    Character.create(monster, out);
    out.ownerId = monster.ownerId;
    out.stats = Stats.create(out.stats);
    return out;
  }
}

export class MonsterIndex {
  monsterId = "";
  name = "";
  sprite = "";

  public static create(data: any): MonsterIndex {
    const out = new MonsterIndex();
    out.monsterId = data.monsterId;
    out.name = data.name;
    out.sprite = data.sprite;
    return out;
  }
}
