import Ability from "@/game-engine/monster-action/Ability";
import * as PIXI from "pixi.js";
import Point from "./Point";

export class CharacterType {
  public static MONSTER = "MONSTER";
  //public static HUMAN = "HUMAN";
}

export class Stats {
  hp = 0;
  maxHP = 0;
  atk = 0;
  def = 0;
  int = 0;
  res = 0;
  hit = 0;
  dex = 0;

  public constructor(
    hp = 0,
    maxHP = 0,
    atk = 0,
    def = 0,
    int = 0,
    res = 0,
    hit = 0,
    dex = 0
  ) {
    this.hp = hp;
    this.maxHP = maxHP;
    this.atk = atk;
    this.def = def;
    this.int = int;
    this.res = res;
    this.hit = hit;
    this.dex = dex;
  }

  public static fromJson(data: any): Stats {
    const out = new Stats();

    out.hp = data.hp;
    out.maxHP = data.maxHP;
    out.atk = data.atk;
    out.def = data.def;
    out.int = data.int;
    out.res = data.res;
    out.hit = data.hit;
    out.dex = data.dex;

    return out;
  }

  public clone(): Stats {
    const out = new Stats();

    out.hp = this.hp;
    out.maxHP = this.maxHP;
    out.atk = this.atk;
    out.def = this.def;
    out.int = this.int;
    out.res = this.res;
    out.hit = this.hit;
    out.dex = this.dex;

    return out;
  }

  public toString(): string {
    return `HP=${this.hp}, maxHP=${this.maxHP}, ATK=${this.atk}, DEF=${this.def}, INT=${this.int}, RES=${this.res}, HIT=${this.hit}, DEX=${this.dex}`;
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
  level = 0;
  experience = 0;
  currentLevelExperience = 0;
  /**
   * Stats at level 1
   */
  baseStats = new Stats();
  /**
   * Stats at current level, with no buf/debuf
   */
  stats = new Stats();
  growthRates = new Stats();

  abilities: Ability[] = [];

  public static fromJson(monster: any): Monster {
    const out = new Monster();
    Character.create(monster, out);
    out.ownerId = monster.ownerId;
    out.level = monster.level;
    out.experience = monster.experience;
    out.currentLevelExperience = monster.currentLevelExperience;
    out.baseStats = Stats.fromJson(out.baseStats);
    out.stats = Stats.fromJson(out.stats);
    out.growthRates = Stats.fromJson(out.growthRates);
    if (monster.abilities) {
      out.abilities = monster.abilities.map((a: any) => Ability.fromJson(a));
    }
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
