import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";
import PlayerRepository from "./repositories/PlayerRepository";

@Service()
export default class PlayerService {
  protected logger = LoggerFactory.getLogger("GameEngine.PlayerService");
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);

  public getPlayerId(): string {
    return this.playerRepository.getPlayerId();
  }
  public completeMap(mapId: string): void {
    this.logger.info(`Map ${mapId} completed`);
    const defeatedMaps = this.playerRepository.getPlayerData().defeatedMaps;
    if (defeatedMaps.indexOf(mapId) === -1) {
      defeatedMaps.push(mapId);
    }
  }
  public getMonsters(): Monster[] {
    return this.playerRepository.getMonsters();
  }
  public addMonster(monster: Monster): void {
    monster.ownerId = this.getPlayerId();
    this.playerRepository.getMonsters().push(monster);
  }
}
