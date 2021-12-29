import Point from "@/models/Point";
import CoordinateService from "@/game-engine/CoordinateService";
import GameService from "@/services/GameService";
import Container from "typedi";
import UserInput from "./UserInput";

/**
 * TODO delete and move "walk" logic outside
 */
export default class WalkUserActionHandler {
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected gameService = Container.get<GameService>(GameService);

  protected source = "";
  protected target: Point | null = null;
  protected completed = false;

  public constructor(source: string) {
    this.source = source;
  }

  process(input: UserInput): void {
    if (this.target) {
      console.debug("Ignore user input, data already provided.");
      return;
    }
    if (input.isTerrain() && input.position) {
      console.log(`${this.source} walks to ${input.position}`);
      this.target = input.position;
      this.walk(this.source, this.target);
      this.completed = true;
      //super.removeHandler();
    }
  }

  walk(source: string, target: Point): void {
    const monster = this.gameService.getMonsterById(source);

    monster.coordinates = target;
    /*
    this.coordinateService.setTileCoordinates(
      monster.getSprite(),
      target,
      this.gameService.getMap()
    );
    */
  }
}
