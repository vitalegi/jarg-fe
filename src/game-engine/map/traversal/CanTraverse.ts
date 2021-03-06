import MapContainer from "@/game-engine/model/map/MapContainer";
import Tile from "@/game-engine/model/map/Tile";
import Monster from "@/game-engine/model/monster/Monster";
import TileRepository from "@/game-engine/repositories/TileRepository";
import Container from "typedi";

export default interface CanTraverse {
  canTraverse(map: MapContainer, monster: Monster, tile: Tile): boolean;
}

export class CanTraverseWalking implements CanTraverse {
  tileRepository = Container.get(TileRepository);
  public canTraverse(map: MapContainer, monster: Monster, tile: Tile): boolean {
    if (!tile) {
      return false;
    }
    const tileConfig = this.tileRepository.getTile(tile.spriteModel);
    if (!tileConfig.walkable) {
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
  public canTraverse(map: MapContainer, monster: Monster, tile: Tile): boolean {
    return true;
  }
}
