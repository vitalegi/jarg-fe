import Monster from "@/game-engine/monster/Monster";
import Container, { Service } from "typedi";
import PlayerRepository from "./repositories/PlayerRepository";

@Service()
export default class PlayerService {
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);

  public getPlayerId(): string {
    return this.playerRepository.getPlayerId();
  }
  public getMonsters(): Monster[] {
    return this.playerRepository.getMonsters();
  }
  public addMonster(monster: Monster): void {
    monster.ownerId = this.getPlayerId();
    this.playerRepository.getMonsters().push(monster);
  }
}
