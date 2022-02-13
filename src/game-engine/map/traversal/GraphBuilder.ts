import MapContainer from "@/game-engine/model/map/MapContainer";
import CanTraverse from "@/game-engine/map/traversal/CanTraverse";
import TraversalPoint from "@/game-engine/map/traversal/TraversalPoint";
import Monster from "@/game-engine/monster/Monster";
import Point from "@/models/Point";

export default class GraphBuilder {
  traversalProvider: CanTraverse;
  public constructor(traversalProvider: CanTraverse) {
    this.traversalProvider = traversalProvider;
  }

  public createGraph(
    map: MapContainer,
    monster: Monster
  ): Map<string, TraversalPoint> {
    const points = new Map<string, TraversalPoint>();
    map.tiles
      .filter((tile) => this.traversalProvider.canTraverse(map, monster, tile))
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
}
