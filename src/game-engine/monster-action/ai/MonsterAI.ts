import MapRepository from "@/game-engine/map/MapRepository";
import { CanTraverseWalking } from "@/game-engine/map/traversal/CanTraverse";
import GraphBuilder from "@/game-engine/map/traversal/GraphBuilder";
import MapTraversal from "@/game-engine/map/traversal/MapTraversal";
import TraversalPoint from "@/game-engine/map/traversal/TraversalPoint";
import Monster from "@/game-engine/monster/Monster";
import MonsterService from "@/game-engine/monster/MonsterService";
import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import RandomService from "@/services/RandomService";
import ArrayUtil from "@/utils/ArrayUtil";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import Ability from "../ability/Ability";
import AbilityExecutor from "../AbilityExecutor";
import MonsterMove from "../MonsterMove";
import MonsterAction from "./MonsterAction";
import ScoreFunction from "./score/score-evaluator/ScoreFunction";
import ScoreEvaluator from "./score/ScoreEvaluator";

export default class MonsterAI {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.AI.MonsterAI");
  protected randomService = Container.get<RandomService>(RandomService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected monsterService = Container.get<MonsterService>(MonsterService);

  protected source: Monster;

  public constructor(source: Monster) {
    this.source = source;
  }

  public async execute(): Promise<void> {
    const steps = this.monsterService.availableActiveMonsterMoves();
    const walkable = TimeUtil.monitor("MonsterAI.walkable", () =>
      this.getAllWalkablePoints(steps)
    ).map((p) => p.point);

    this.logger.info(`Step 1: ${walkable.length} possible walkable locations`);

    const availableActions = TimeUtil.monitor(
      "MonsterAI.availableActions",
      () =>
        this.getUsableAbilities().flatMap((ability) =>
          this.getPossibleTargets(walkable, ability)
        )
    );
    this.logger.info(`Step 2: ${availableActions.length} possible actions`);

    if (availableActions.length > 0) {
      const action = await TimeUtil.monitorAsync("MonsterAI.action", () =>
        new ScoreEvaluator(
          this.source,
          availableActions,
          new ScoreFunction()
        ).selectBestAction()
      );
      this.logger.info(
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
      this.logger.info(
        "Step 4. No target, find all reachable enemies in 3 turns and walk towards one of them"
      );
      const target = TimeUtil.monitor("MonsterAI.walkable", () =>
        this.getNearestTarget()
      );
      if (!target) {
        this.logger.info(
          `No reachable enemy, terminate without doing anything.`
        );
      } else {
        this.logger.info(`Walk towards ${target.toString()}`);
        const fullPath = this.getMoveMapTraversal().getPath(target);
        // TODO FIXME targetPoint should be empty
        const targetPoint = fullPath[steps];
        this.logger.info(`Mid point is ${targetPoint.toString()}`);
        await this.move(targetPoint);
      }
    }
  }

  protected getPossibleTargets(
    startingPoints: Point[],
    ability: Ability
  ): MonsterAction[] {
    return ArrayUtil.removeDuplicates(
      startingPoints.flatMap((point) =>
        this.getTargetsInRange(point, ability).flatMap(
          (target) => new MonsterAction(point, ability, target)
        )
      ),
      (a, b) => a.equals(b)
    );
  }

  protected getAllWalkablePoints(maxDistance: number): TraversalPoint[] {
    return this.getMoveMapTraversal().getPoints(maxDistance);
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
    return this.getEnemies().filter((m) =>
      this.isInRange(source, m, ability.abilityTarget.range)
    );
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

  protected getUsableAbilities(): Ability[] {
    return this.source.abilities.filter((a) => a.usages.current > 0);
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
    this.logger.info(`Walkable points: ${walkablePoints.length}`);

    const reachableTargets = targets
      .flatMap((target) =>
        this.getNeighborPoint(target, walkablePoints).flatMap((point) => {
          return {
            target: target,
            point: point,
          };
        })
      )
      .filter((e) => this.isEmpty(e.point.point));

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

  protected isEmpty(point: Point): boolean {
    return (
      this.mapRepository
        .getMap()
        .monsters.filter((m) => m.coordinates?.equals(point)).length === 0
    );
  }
}
