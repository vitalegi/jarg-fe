import Monster from "@/game-engine/monster/Monster";
import MapContainer from "../MapContainer";
import Tile from "../Tile";

export default interface CanTraverse {
  canTraverse(map: MapContainer, monster: Monster, tile: Tile): boolean;
}

export class CanTraverseWalking implements CanTraverse {
  public canTraverse(map: MapContainer, monster: Monster, tile: Tile): boolean {
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

export class CanTraverseAbility implements CanTraverse {
  ignoreSelf = false;
  ignoreAllies = false;

  public canTraverse(map: MapContainer, monster: Monster, tile: Tile): boolean {
    if (!tile) {
      return false;
    }
    const validTargetsOnThisTile = map.monsters
      .filter((m) => m.coordinates?.equals(tile.coordinates))
      // self
      .filter((m) => m.uuid !== monster.uuid || !this.ignoreSelf)
      // allies
      .filter((m) => m.ownerId !== monster.ownerId || !this.ignoreAllies);

    if (validTargetsOnThisTile.length > 0) {
      return true;
    }
    return false;
  }
}
