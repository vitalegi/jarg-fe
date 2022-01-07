import Point from "@/models/Point";

export default class TraversalPoint {
  public static INFINITY = 10000000;

  point: Point;
  previous: TraversalPoint | null;
  cost: number;
  visited = false;
  neighbors: TraversalPoint[] = [];

  public constructor(point: Point) {
    this.point = point;
    this.previous = null;
    this.cost = TraversalPoint.INFINITY;
  }

  public static getId(point: Point): string {
    return point.x + "_" + point.y;
  }
}
