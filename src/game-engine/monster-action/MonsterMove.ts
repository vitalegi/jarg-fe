import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import Container from "typedi";
import Point from "@/models/Point";
import MonsterMoveDrawer from "../ui/MonsterMoveDrawer";

export default class MonsterMove {
  protected gameService = Container.get<GameService>(GameService);

  protected source;
  protected path;

  public constructor(source: Monster, path: Point[]) {
    this.source = source;
    this.path = path;
  }

  public async execute(): Promise<void> {
    console.log(`Path ${this.path}, starting from: ${this.source.coordinates}`);
    for (let i = 0; i < this.path.length - 1; i++) {
      const from = this.path[i];
      const to = this.path[i + 1];
      console.log(`Walk from ${from} to ${to}`);
      const drawer = new MonsterMoveDrawer(this.source, from, to);
      this.gameService.addGameLoopHandler(drawer);
      await drawer.notifyWhenCompleted();
      this.source.coordinates = to.clone();
    }
  }
}
