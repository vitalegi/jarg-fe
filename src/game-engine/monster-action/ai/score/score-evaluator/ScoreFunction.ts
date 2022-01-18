import Monster from "@/game-engine/monster/Monster";
import MonsterAction from "../../MonsterAction";

export default class ScoreFunction {
  public async getScore(
    source: Monster,
    action: MonsterAction
  ): Promise<number> {
    const effects = await action.ability
      .getProcessor()
      .execute(source, action.target, action.ability);
    return effects
      .map((e) => {
        const ee = e as any;
        if (ee.damage) {
          return ee.damage;
        }
        return 0;
      })
      .reduce((prev, cur) => prev + cur, 0);
  }
}
