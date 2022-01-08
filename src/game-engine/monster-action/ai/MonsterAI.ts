import MapRepository from "@/game-engine/map/MapRepository";
import { CanTraverseWalking } from "@/game-engine/map/traversal/CanTraverse";
import GraphBuilder from "@/game-engine/map/traversal/GraphBuilder";
import MapTraversal from "@/game-engine/map/traversal/MapTraversal";
import TraversalPoint from "@/game-engine/map/traversal/TraversalPoint";
import Monster from "@/game-engine/monster/Monster";
import MonsterService from "@/game-engine/monster/MonsterService";
import Point from "@/models/Point";
import RandomService from "@/services/RandomService";
import ArrayUtil from "@/utils/ArrayUtil";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import Ability from "../Ability";
import AbilityExecutor from "../AbilityExecutor";
import MonsterMove from "../MonsterMove";

class MonsterAction {
  from;
  ability;
  target;
  public constructor(from: Point, ability: Ability, target: Monster) {
    this.from = from;
    this.ability = ability;
    this.target = target;
  }

  public equals(other: MonsterAction): boolean {
    return (
      this.from.equals(other.from) &&
      this.ability.id === other.ability.id &&
      this.target.uuid === other.target.uuid
    );
  }
}

export default class MonsterAI {
  protected randomService = Container.get<RandomService>(RandomService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected monsterService = Container.get<MonsterService>(MonsterService);

  protected source: Monster;

  public constructor(source: Monster) {
    this.source = source;
  }

  public async execute(): Promise<void> {
    console.log("MonsterAI 1. find all the reachable locations in this turn");

    const steps = this.monsterService.availableActiveMonsterMoves();
    const walkable = TimeUtil.monitor("MonsterAI.walkable", () =>
      this.getAllWalkablePoints(steps)
    ).map((p) => p.point);
    console.log(
      `MonsterAI, step1: ${walkable.length} possible walkable locations`
    );

    console.log(
      "MonsterAI 2. for each location, for each ability find hittable targets"
    );
    const availableActions = TimeUtil.monitor(
      "MonsterAI.availableActions",
      () =>
        this.getUsableAbilities().flatMap((ability) =>
          this.getPossibleTargets(walkable, ability)
        )
    );
    console.log(
      `MonsterAI, step2: ${availableActions.length} possible actions`
    );

    console.log("MonsterAI 3. find best ability to use");
    if (availableActions.length > 0) {
      const action = TimeUtil.monitor("MonsterAI.action", () =>
        this.selectBestAction(availableActions)
      );

      await this.move(action.from);
      const executor = new AbilityExecutor(
        this.source,
        action.target,
        action.ability
      );
      await executor.execute();
    } else {
      console.log(
        "MonsterAI 4. if no target, find all reachable enemies in 3 turns and walk towards them"
      );
      const target = TimeUtil.monitor("MonsterAI.walkable", () =>
        this.getNearestTarget()
      );
      if (!target) {
        console.log(`MonsterAI No reachable enemy`);
      } else {
        console.log(`MonsterAI Walk towards `, target);
        const fullPath = this.getMoveMapTraversal().getPath(target);
        const targetPoint = fullPath[steps];
        console.log(`MonsterAI Target `, targetPoint);
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

  protected selectBestAction(actions: MonsterAction[]): MonsterAction {
    // TODO
    return actions[0];
  }

  protected getNearestTarget(): Point | null {
    const targets = this.getEnemies();

    const walkablePoints = this.getAllWalkablePoints(
      3 * this.source.movements.steps
    );
    console.log(`MonsterAI Walkable points: ${walkablePoints.length}`);

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

    console.log(
      `MonsterAI Reachable targets: ${reachableTargets.length}`,
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
