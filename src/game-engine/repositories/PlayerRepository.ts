import { Monster } from "@/models/Character";
import Point from "@/models/Point";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import MonsterService from "../monster/MonsterService";

const playerId = UuidUtil.nextId();

const monsters: Monster[] = [];

@Service()
export default class PlayerRepository {
  public getPlayerId(): string {
    return playerId;
  }
  public getMonsters(): Monster[] {
    if (monsters.length == 0) {
      const monsterService = Container.get<MonsterService>(MonsterService);
      monsters.push(monsterService.createMonster(playerId));
      monsters.push(monsterService.createMonster(playerId));
      monsters.push(monsterService.createMonster(playerId));
      monsters[0].coordinates = new Point(1, 1);
      monsters[1].coordinates = new Point(1, 2);
      monsters[2].coordinates = new Point(3, 1);
    }
    return monsters;
  }
}
