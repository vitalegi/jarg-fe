import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import TypeService from "@/game-engine/type/TypeService";
import Container from "typedi";

export default abstract class AbstractProcessor {
  protected typeService = Container.get(TypeService);
  protected monsterIndexService = Container.get(MonsterIndexService);

  public abstract execute(
    source: Monster,
    target: Monster,
    ability: Ability
  ): Promise<ComputedEffect[]>;
}
