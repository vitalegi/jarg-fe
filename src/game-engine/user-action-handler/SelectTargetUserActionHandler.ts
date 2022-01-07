import Point from "@/models/Point";
import Container from "typedi";
import MapRepository from "../map/MapRepository";
import Tile from "../map/Tile";
import UserActionHandler from "./UserActionHandler";
import UserInput from "./UserInput";

export default class SelectTargetUserActionHandler extends UserActionHandler {
  protected mapRepository = Container.get<MapRepository>(MapRepository);

  protected skipUUID: string | null = "";
  protected allowTerrains = false;
  protected allowMonsters = false;
  protected allowedPoints: Point[] | null;

  public getName(): string {
    return "SelectTargetUserActionHandler";
  }

  public constructor(
    skipUUID: string | null,
    allowTerrains: boolean,
    allowMonsters: boolean,
    allowedPoints: Point[] | null = null
  ) {
    super();
    this.skipUUID = skipUUID;
    this.allowTerrains = allowTerrains;
    this.allowMonsters = allowMonsters;
    this.allowedPoints = allowedPoints;
  }

  public acceptTap(): boolean {
    return true;
  }

  public processTap(input: UserInput): void {
    if (!this.acceptInput(input)) {
      return;
    }
    if (input.isTerrain()) {
      this.done(input);
    }
    if (input.isMonster()) {
      this.done(input);
    }
  }

  public getAcceptableTiles(): Tile[] {
    return this.mapRepository.getMap().tiles.filter((tile) => {
      const monstersOnTile = this.mapRepository.getMonstersOnTile(tile);
      if (monstersOnTile.length > 0) {
        return this.acceptInput(UserInput.monsterInput(monstersOnTile[0].uuid));
      }
      return this.acceptInput(UserInput.terrainInput(tile.coordinates.clone()));
    });
  }

  protected acceptInput(input: UserInput): boolean {
    if (!this.isAllowedPoint(input)) {
      return false;
    }
    if (input.isTerrain() && this.acceptTerrain(input.getPosition())) {
      return true;
    }
    if (input.isMonster() && this.acceptMonster(input.getMonsterId())) {
      return true;
    }
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected acceptTerrain(point: Point): boolean {
    return this.allowTerrains;
  }
  protected acceptMonster(uuid: string): boolean {
    if (!this.allowMonsters) {
      return false;
    }
    if (this.skipUUID === uuid) {
      return false;
    }
    return true;
  }
  protected isAllowedPoint(input: UserInput): boolean {
    let point: Point | null = null;
    if (input.isTerrain()) {
      point = input.getPosition();
    }
    if (input.isMonster()) {
      const monster = this.mapRepository.getMonsterById(input.getMonsterId());
      point = monster.coordinates;
    }
    if (!this.allowedPoints || !point) {
      return true;
    }
    return this.allowedPoints.filter((p) => p.equals(point)).length > 0;
  }
}
