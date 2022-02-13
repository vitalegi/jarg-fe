import Monster from "@/game-engine/monster/Monster";
import MapContainer from "@/game-engine/model/map/MapContainer";
import Point from "@/models/Point";
import TimeUtil from "@/utils/TimeUtil";
import LoggerFactory from "@/logger/LoggerFactory";
import GraphBuilder from "@/game-engine/map/traversal/GraphBuilder";
import TraversalPoint from "@/game-engine/map/traversal/TraversalPoint";
import Tile from "@/game-engine/model/map/Tile";

export default class MapTraversal {
  logger = LoggerFactory.getLogger("GameEngine.Map.Traversal");
  map;
  monster;
  debug = false;
  builder;

  public constructor(
    map: MapContainer,
    monster: Monster,
    builder: GraphBuilder
  ) {
    this.map = map;
    this.monster = monster;
    this.builder = builder;
  }

  public getPath(target: Point): Point[] {
    const start = this.monster.coordinates;
    if (!start) {
      throw Error(`Missing starting point`);
    }
    const graph = this.buildGraph();

    const path = TimeUtil.monitor(
      "minimumPath",
      () => this.minimumPath(graph, start, target),
      10
    );
    this.logger.debug(`Path from ${start} to ${target}: ${path.join(",")}`);
    return path;
  }

  public getPoints(maxDistance: number): TraversalPoint[] {
    const start = this.monster.coordinates;
    if (!start) {
      throw Error(`Missing starting point`);
    }
    return TimeUtil.monitor(
      "getPoints",
      () => {
        const graph = this.buildGraph();
        this.dijkstra(graph, start);
        const points: TraversalPoint[] = [];
        graph.forEach((point: TraversalPoint) => {
          if (point.cost <= maxDistance) {
            points.push(point);
          }
        });
        return points;
      },
      10
    );
  }

  protected buildGraph(): Map<string, TraversalPoint> {
    return TimeUtil.monitor(
      "buildGraph",
      () => this.builder.createGraph(this.map, this.monster),
      10
    );
  }

  protected minimumPath(
    graph: Map<string, TraversalPoint>,
    start: Point,
    target: Point
  ): Point[] {
    this.dijkstra(graph, start);

    const targetEntry = this.getGraphEntry(graph, target);
    if (targetEntry.previous === null) {
      throw Error(`Cannot compute a valid path between ${start} and ${target}`);
    }
    const path: Point[] = [];
    let entry: TraversalPoint | null = targetEntry;
    while (entry !== null && entry.previous?.point !== start) {
      path.push(entry.point);
      entry = entry.previous;
    }
    path.reverse();
    return path;
  }

  protected dijkstra(graph: Map<string, TraversalPoint>, start: Point): void {
    graph.forEach((entry) => {
      entry.visited = false;
      entry.cost = TraversalPoint.INFINITY;
      entry.previous = null;
    });
    this.getGraphEntry(graph, start).cost = 0;

    const unvisited: TraversalPoint[] = [];
    graph.forEach((value) => unvisited.push(value));

    while (unvisited.length > 0) {
      // select nearest unvisited
      let index = 0;
      for (let i = 0; i < unvisited.length; i++) {
        if (unvisited[i].cost < unvisited[index].cost) {
          index = i;
        }
      }

      // remove nearest from the unvisited list & mark visited
      const nearestUnvisited = unvisited[index];
      unvisited.splice(index, 1);
      nearestUnvisited.visited = true;

      // for all unvisited neighbors, check if path improves
      nearestUnvisited.neighbors
        .filter((neighbor) => !neighbor.visited)
        .forEach((unvisitedNeighbor) => {
          const alt = nearestUnvisited.cost + 1;
          if (alt < unvisitedNeighbor.cost) {
            unvisitedNeighbor.cost = alt;
            unvisitedNeighbor.previous = nearestUnvisited;
          }
        });
    }

    if (this.debug) {
      graph.forEach((entry) => {
        this.logger.debug(
          `GRAPH RESULT: from ${start} to ${entry.point} costs ${entry.cost}, prev: ${entry.previous?.point}`
        );
      });
    }
  }

  protected getTile(point: Point): Tile | null {
    const tiles = this.map.tiles.filter((t) => t.coordinates === point);
    if (tiles.length > 0) {
      return tiles[0];
    }
    return null;
  }

  protected getGraphEntry(
    graph: Map<string, TraversalPoint>,
    point: Point
  ): TraversalPoint {
    const key = TraversalPoint.getId(point);
    if (graph.has(key)) {
      return graph.get(key) as TraversalPoint;
    }
    throw Error(`Graph does not contain ${key}: ${point}`);
  }
}
