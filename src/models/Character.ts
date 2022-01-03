import Ability from "@/game-engine/monster-action/Ability";
import { Animation, AnimationSrc } from "./Animation";
import Move from "./Move";
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
  coordinates: Point | null = null;
  movements = new Move();

  public static fromJson(data: any, out: Character): Character {
    out.uuid = data.uuid;
    out.name = data.name;
    out.type = data.type;
    out.modelId = data.modelId;
    out.coordinates = Point.fromJson(data.coordinates);
    out.movements = Move.fromJson(data.movements);
    return out;
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
    Character.fromJson(monster, out);
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
  animationsSrc: AnimationSrc[] = [];
  animations: Animation[] = [];

  public static fromJson(data: any): MonsterIndex {
    const out = new MonsterIndex();
    out.monsterId = data.monsterId;
    out.name = data.name;

    if (data.animationsSrc) {
      out.animationsSrc = data.animationsSrc.map((a: any) =>
        AnimationSrc.fromJson(a)
      );
    }

    return out;
  }
}
