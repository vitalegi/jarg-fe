import { CharacterType, Monster, Stats } from "@/models/Character";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import MonsterService from "./MonsterService";

const playerId = UuidUtil.nextId();

const monsterService = Container.get<MonsterService>(MonsterService);

const monsters = [
  monsterService.createMonster(playerId),
  monsterService.createMonster(playerId),
];

@Service()
export default class PlayerService {
  public getPlayerId(): string {
    return playerId;
  }
  public getMonsters(): Monster[] {
    return monsters;
  }
}
