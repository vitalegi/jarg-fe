import { Monster } from "@/models/Character";
import Point from "@/models/Point";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import MonsterService from "./MonsterService";

const playerId = UuidUtil.nextId();

const monsterService = Container.get<MonsterService>(MonsterService);

const monsters = [
  monsterService.createMonster(playerId),
  monsterService.createMonster(playerId),
];

monsters[0].coordinates = new Point(4, 5);

@Service()
export default class PlayerService {
  public getPlayerId(): string {
    return playerId;
  }
  public getMonsters(): Monster[] {
    return monsters;
  }
}
