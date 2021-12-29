import { Monster } from "@/models/Character";
import Point from "@/models/Point";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import MonsterService from "../monster/MonsterService";

const playerId = UuidUtil.nextId();

const monsterService = Container.get<MonsterService>(MonsterService);

const monsters = [
  monsterService.createMonster(playerId),
  monsterService.createMonster(playerId),
];

monsters[0].coordinates = new Point(4, 5);

@Service()
export default class PlayerRepository {
  public getPlayerId(): string {
    return playerId;
  }
  public getMonsters(): Monster[] {
    return monsters;
  }
}
