import Monster from "@/game-engine/monster/Monster";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import TypeService from "@/game-engine/types/TypeService";
import Container from "typedi";
import Ability from "../ability/Ability";
import ComputedEffect from "../computed-effect/ComputedEffect";
import Effect from "../effects/effect/Effect";

export default abstract class AbstractProcessor {
  protected typeService = Container.get<TypeService>(TypeService);
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);

  public abstract execute(
    source: Monster,
    target: Monster,
    ability: Ability
  ): Promise<ComputedEffect[]>;
}
