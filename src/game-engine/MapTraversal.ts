import { Monster } from "@/models/Character";
import MapContainer, { Tile } from "@/models/Map";
import Point from "@/models/Point";
import TimeUtil from "@/utils/TimeUtil";

const INFINITY = 10000000;
class TraversalPoint {
  point: Point;
  previous: TraversalPoint | null;
  cost: number;
  visited = false;
  neighbors: TraversalPoint[] = [];

  public constructor(point: Point) {
    this.point = point;
    this.previous = null;
    this.cost = INFINITY;
  }

  public static getId(point: Point): string {
    return point.x + "_" + point.y;
  }
}

class GraphBuilder {
  public createGraph(
    map: MapContainer,
    monster: Monster
  ): Map<string, TraversalPoint> {
    const points = new Map<string, TraversalPoint>();
    map.tiles
      .filter((tile) => this.canTraverse(map, monster, tile))
      .forEach((tile) => {
        const traversalPoint = new TraversalPoint(tile.coordinates);
        points.set(TraversalPoint.getId(traversalPoint.point), traversalPoint);
      });
    points.forEach((tile) => {
      tile.neighbors = [
        new Point(tile.point.x - 1, tile.point.y),
        new Point(tile.point.x + 1, tile.point.y),
        new Point(tile.point.x, tile.point.y - 1),
        new Point(tile.point.x, tile.point.y + 1),
      ]
        .filter((point) => points.has(TraversalPoint.getId(point)))
        .map((point) => points.get(TraversalPoint.getId(point)))
        .map((tp) => tp as TraversalPoint);
    });
    return points;
  }

  protected canTraverse(
    map: MapContainer,
    monster: Monster,
    tile: Tile
  ): boolean {
    if (!tile) {
      return false;
    }

    const enemiesOnThisTile = map.monsters
      .filter(
        (m) =>
          m.coordinates?.x === tile.coordinates.x &&
          m.coordinates?.y === tile.coordinates.y
      )
      // ignore self
      .filter((m) => m.uuid !== monster.uuid)
      // ignore allies
      .filter((m) => m.ownerId !== monster.ownerId);

    if (enemiesOnThisTile.length > 0) {
      return false;
    }
    return true;
  }
}

export default class MapTraversal {
  map;
  monster;
  debug = false;

  public constructor(map: MapContainer, monster: Monster) {
    this.map = map;
    this.monster = monster;
  }

  public getPath(target: Point): Point[] {
    const start = this.monster.coordinates;
    if (!start) {
      throw Error(`Missing starting point`);
    }
    let now = TimeUtil.timestamp();
    const graph = new GraphBuilder().createGraph(this.map, this.monster);
    let duration = Math.round(100 * (TimeUtil.timestamp() - now)) / 100;
    console.log(`MONITORING getGraph duration=${duration}ms`);

    now = TimeUtil.timestamp();
    const path = this.minimumPath(graph, start, target);
    duration = Math.round(100 * (TimeUtil.timestamp() - now)) / 100;
    console.log(`MONITORING dijkstra duration=${duration}ms`);
    console.log(`Path from ${start} to ${target}: ${path.join(",")}`);
    return path;
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
      entry.cost = INFINITY;
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
        console.log(
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
