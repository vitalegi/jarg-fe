import Point from "@/models/Point";
import CoordinateService from "@/services/CoordinateService";
import GameService from "@/services/GameService";
import UserActionService from "@/services/UserActionService";
import Container from "typedi";
import ActionHandler from "./ActionHandler";
import UserInput from "./UserInput";

export default class WalkActionHandler extends ActionHandler {
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected gameService = Container.get<GameService>(GameService);

  protected source = "";
  protected target: Point | null = null;
  protected completed = false;

  public constructor(source: string) {
    super();
    this.source = source;
  }

  start(input: UserInput): void {
    if (input.isMonster() && input.uuid) {
      this.source = input.uuid;
    } else {
      throw new Error("Invalid input, expected a monster.");
    }
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
      super.removeHandler();
    }
  }
  isCompleted(): boolean {
    return this.completed;
  }

  walk(source: string, target: Point): void {
    const monster = this.gameService.getMonsterById(source);

    monster.coordinates = target;
    this.coordinateService.setTileCoordinates(
      monster.getSprite(),
      target,
      this.gameService.getMap()
    );
  }
}
