import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import ArrayUtil from "@/utils/ArrayUtil";
import MonsterAction from "../MonsterAction";
import ScoreFunction from "./score-evaluator/ScoreFunction";

const MAX_ITERATIONS = 150;

export default class ScoreEvaluator {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.AI.Score.ScoreEvaluator"
  );

  source;
  actions;
  scoreFunction;

  public constructor(
    source: Monster,
    actions: MonsterAction[],
    scoreFunction: ScoreFunction
  ) {
    this.source = source;
    this.actions = actions;
    this.scoreFunction = scoreFunction;
  }

  public async selectBestAction(): Promise<MonsterAction> {
    const initialSet = this.actions.length;
    this.actions = this.removeDuplicate(this.actions);

    const simulationsPerEntry = Math.max(
      1,
      Math.ceil(MAX_ITERATIONS / this.actions.length)
    );

    this.logger.info(
      `Reducing possibilities from ${initialSet} to ${this.actions.length}. Will perform ${simulationsPerEntry} simulations per entry`
    );

    const evaluations: Promise<MonsterAction>[] = [];
    for (const action of this.actions) {
      evaluations.push(this.evaluateScore(action, simulationsPerEntry));
    }

    // evaluate all possibilities
    await Promise.all(evaluations);
    this.actions = this.actions.sort(this.scoreDesc());

    if (this.logger.isDebugEnabled()) {
      this.logger.debug(
        "Possible actions:",
        this.actions.map((a) => {
          return {
            ability: a.ability.label,
            score: a.score,
            targetPosition: a.target.coordinates?.toString(),
          };
        })
      );
    }
    return this.actions[0];
  }

  protected async evaluateScore(
    action: MonsterAction,
    attempts: number
  ): Promise<MonsterAction> {
    const scores: Promise<number>[] = [];

    for (let i = 0; i < attempts; i++) {
      scores.push(this.scoreFunction.getScore(this.source, action));
    }
    action.scores.push(...(await Promise.all(scores)));
    action.score = this.getPartialScore(action.scores);
    return action;
  }

  protected removeDuplicate(actions: MonsterAction[]): MonsterAction[] {
    return ArrayUtil.removeDuplicates(
      actions,
      (a, b) => a.ability.id === b.ability.id && a.target.uuid === b.target.uuid
    );
  }

  protected getPartialScore(scores: number[]): number {
    return scores.reduce((curr, prev) => curr + prev, 0);
  }

  protected scoreDesc(): (a: MonsterAction, b: MonsterAction) => number {
    return (a, b) => (a.score < b.score ? 1 : -1);
  }
}
