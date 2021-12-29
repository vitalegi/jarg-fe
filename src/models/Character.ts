import Ability from "@/game-engine/monster-action/Ability";
import * as PIXI from "pixi.js";
import Point from "./Point";
import Stats from "./Stats";

export class CharacterType {
  public static MONSTER = "MONSTER";
  //public static HUMAN = "HUMAN";
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
