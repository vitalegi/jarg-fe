import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import AbilityLearned from "@/game-engine/model/ability/AbilityLearned";
import Monster from "@/game-engine/monster/Monster";
import { CharacterType } from "@/models/Character";
import Move from "@/models/Move";
import { asInt, asIntNullable, asString } from "@/utils/JsonUtil";

export default class MonsterData {
  ownerId: string | null = "";
  level = 0;
  experience = 0;
  hp: number | null = 0;
  currentLevelExperience = 0;
  activeEffects: ComputedEffect[] = [];
  abilities: AbilityLearned[] = [];
  uuid = "";
  name = "";
  type = CharacterType.MONSTER;
  modelId = "";
  movements = new Move();

  public static fromJson(data: any): MonsterData {
    const out = new MonsterData();
    out.hp = asIntNullable(data.hp);

    out.uuid = asString(data.uuid);
    out.name = asString(data.name);
    out.type = asString(data.type);
    out.modelId = asString(data.modelId);
    out.movements = Move.fromJson(data.movements);
    out.ownerId = asString(data.ownerId);
    out.level = asInt(data.level);
    out.experience = asInt(data.experience);
    out.currentLevelExperience = asInt(data.currentLevelExperience);
    if (data.abilities) {
      out.abilities = data.abilities.map(AbilityLearned.fromJson);
    }
    if (data.activeEffects) {
      // TODO check implementation
      out.activeEffects = data.activeEffects.map((e: ComputedEffect) =>
        e.clone()
      );
    }
    return out;
  }

  public static fromMonster(data: Monster): MonsterData {
    const out = new MonsterData();
    out.hp = data.stats.hp;

    out.uuid = data.uuid;
    out.name = data.name;
    out.type = data.type;
    out.modelId = data.modelId;
    out.movements = Move.fromJson(data.movements);
    out.ownerId = data.ownerId;
    out.level = data.level;
    out.experience = data.experience;
    out.currentLevelExperience = data.currentLevelExperience;
    if (data.abilities) {
      out.abilities = data.abilities.map(AbilityLearned.fromJson);
    }
    if (data.activeEffects) {
      out.activeEffects = data.activeEffects.map((e: ComputedEffect) =>
        e.clone()
      );
    }
    return out;
  }
}
