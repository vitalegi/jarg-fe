import AbilityExecutor from "@/game-engine/ability/AbilityExecutor";
import Ability from "@/game-engine/model/ability/Ability";
import MonsterMove from "@/game-engine/ability/MonsterMove";
import MapRepository from "@/game-engine/map/MapRepository";
import { CanTraverseWalking } from "@/game-engine/map/traversal/CanTraverse";
import GraphBuilder from "@/game-engine/map/traversal/GraphBuilder";
import MapTraversal from "@/game-engine/map/traversal/MapTraversal";
import TraversalPoint from "@/game-engine/map/traversal/TraversalPoint";
import Monster from "@/game-engine/monster/Monster";
import MonsterService from "@/game-engine/monster/MonsterService";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";
import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import RandomService from "@/services/RandomService";
import ArrayUtil from "@/utils/ArrayUtil";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import AbilityLearned from "@/game-engine/model/ability/AbilityLearned";
import ScoreEvaluator from "@/game-engine/ai/score/ScoreEvaluator";
import ScoreFunction from "@/game-engine/ai/score/score-evaluator/ScoreFunction";
import MonsterAction from "@/game-engine/ai/MonsterAction";

export default class MonsterAI {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.AI.MonsterAI");
  protected randomService = Container.get<RandomService>(RandomService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);

  protected source: Monster;

  public constructor(source: Monster) {
    this.source = source;
  }

  public async execute(): Promise<void> {
    const steps = this.monsterService.availableActiveMonsterMoves();
    const walkable = TimeUtil.monitor(
      "MonsterAI.walkable",
      () => this.getAllWalkablePoints(steps),
      10
    ).map((p) => p.point);

    this.logger.debug(`Step 1: ${walkable.length} possible walkable locations`);

    const availableActions = TimeUtil.monitor(
      "MonsterAI.availableActions",
      () =>
        this.getUsableAbilities().flatMap((ability) =>
          this.getPossibleTargets(walkable, ability)
        ),
      50
    );
    this.logger.debug(`Step 2: ${availableActions.length} possible actions`);

    if (availableActions.length > 0) {
      const action = await TimeUtil.monitorAsync(
        "MonsterAI.action",
        () =>
          new ScoreEvaluator(
            this.source,
            availableActions,
            new ScoreFunction()
          ).selectBestAction(),
        300
      );
      this.logger.debug(
        `Step 3: will perform ${action.ability.id} / ${
          action.ability.label
        } from ${action.from.toString()} against ${
          action.target.coordinates
        } (${action.target.uuid} ${action.target.name})`
      );
      await this.move(action.from);
      const executor = new AbilityExecutor(
        this.source,
        action.target,
        action.ability
      );
      await executor.execute();
    } else {
      this.logger.debug(
        "Step 4. No target, find all reachable enemies in 3 turns and walk towards one of them"
      );
      const target = TimeUtil.monitor(
        "MonsterAI.walkable",
        () => this.getNearestTarget(),
        5
      );
      if (!target) {
        this.logger.debug(
          `No reachable enemy, terminate without doing anything.`
        );
      } else {
        await this.walkTowards(target, steps);
      }
    }
  }

  protected getPossibleTargets(
    startingPoints: Point[],
    learnable: AbilityLearned
  ): MonsterAction[] {
    const ability = this.abilityRepository.getAbility(learnable.abilityId);
    const actions = startingPoints.flatMap((standingPoint) =>
      this.getTargetsInRange(standingPoint, ability).flatMap(
        (target) => new MonsterAction(standingPoint, ability, target)
      )
    );
    ArrayUtil.randomize(actions);
    return ArrayUtil.removeDuplicates(actions, (a, b) => a.equals(b));
  }

  protected getAllWalkablePoints(maxDistance: number): TraversalPoint[] {
    return (
      this.getMoveMapTraversal()
        .getPoints(maxDistance)
        // cost = 0 ==> you stay where you are
        .filter((tp) => tp.cost === 0 || this.isEmptyPoint(tp.point))
    );
  }

  protected getMoveMapTraversal(): MapTraversal {
    return new MapTraversal(
      this.mapRepository.getMap(),
      this.source,
      new GraphBuilder(new CanTraverseWalking())
    );
  }

  protected getDistance(source: Point, dest: Point | null): number {
    if (dest === null) {
      return 1000000;
    }
    return Math.abs(source.x - dest.x) + Math.abs(source.y - dest.y);
  }

  protected getTargetsInRange(source: Point, ability: Ability): Monster[] {
    const inRange = this.getEnemies().filter((m) =>
      this.isInRange(source, m, ability.abilityTarget.range)
    );
    this.logger.debug(
      `Targets in range (${
        ability.abilityTarget.range
      }) from ${source.toString()}: ${inRange.length}`
    );
    return inRange;
  }

  protected getEnemies(): Monster[] {
    return this.mapRepository.getMap().monsters.filter((m) => this.isEnemy(m));
  }

  protected isEnemy(target: Monster): boolean {
    if (this.source.ownerId === null) {
      return target.ownerId !== null;
    }
    return this.source.ownerId !== target.ownerId;
  }

  protected isInRange(
    source: Point,
    target: Monster,
    distance: number
  ): boolean {
    if (!target.coordinates) {
      return false;
    }
    return this.getDistance(source, target.coordinates) <= distance;
  }

  protected getUsableAbilities(): AbilityLearned[] {
    return this.source.abilities.filter((a) => a.currentUsages > 0);
  }

  protected async move(target: Point): Promise<void> {
    if (target.equals(this.source.coordinates)) {
      return;
    }
    const path = this.getMoveMapTraversal().getPath(target);
    await new MonsterMove(this.source, path).execute();
  }

  protected getNearestTarget(): Point | null {
    const targets = this.getEnemies();

    const walkablePoints = this.getAllWalkablePoints(
      3 * this.source.movements.steps
    );
    this.logger.debug(`Walkable points: ${walkablePoints.length}`);

    const reachableTargets = targets
      .flatMap((target) =>
        this.getNeighborPoint(target, walkablePoints).flatMap((point) => {
          return {
            target: target,
            point: point,
          };
        })
      )
      .filter((e) => this.isEmptyPoint(e.point.point));

    this.logger.debug(
      `Reachable targets: ${reachableTargets.length}`,
      reachableTargets
    );

    if (reachableTargets.length === 0) {
      return null;
    }
    // the nearest is the one with the lowest cost
    return reachableTargets.sort((a, b) =>
      a.point.cost < b.point.cost ? -1 : 1
    )[0].point.point;
  }

  protected getNeighborPoint(
    target: Monster,
    points: TraversalPoint[]
  ): TraversalPoint[] {
    if (!target.coordinates) {
      return [];
    }
    return points.filter(
      (point) => this.getDistance(point.point, target.coordinates) <= 1
    );
  }

  protected async walkTowards(target: Point, maxSteps: number): Promise<void> {
    try {
      this.logger.debug(
        `Walk towards ${target.toString()}, ${maxSteps} steps available`
      );
      const fullPath = this.getMoveMapTraversal().getPath(target);
      let remainingSteps = maxSteps;
      let targetPoint = fullPath[remainingSteps];
      while (!this.isEmptyPoint(targetPoint) && remainingSteps > 0) {
        this.logger.debug(
          `Walk towards ${target.toString()}, ${targetPoint.toString()} is not valid, try another`
        );
        targetPoint = fullPath[--remainingSteps];
      }
      this.logger.debug(
        `Walk towards ${target.toString()}, mid point is ${targetPoint.toString()}`
      );
      await this.move(targetPoint);
    } catch (e) {
      this.logger.error(`Failed to come closer to ${target}`);
    }
  }

  protected isEmptyPoint(point: Point): boolean {
    return this.mapRepository.getMonstersOnCoordinates(point).length === 0;
  }
}
