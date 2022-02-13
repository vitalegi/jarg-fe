import Monster from "@/game-engine/monster/Monster";
import MonsterData from "@/game-engine/monster/MonsterData";
import PlayerData from "@/game-engine/PlayerData";
import PlayerRepository from "@/game-engine/repositories/PlayerRepository";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";

@Service()
export default class PlayerService {
  protected logger = LoggerFactory.getLogger("GameEngine.PlayerService");
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);

  public getPlayerId(): string {
    return this.playerRepository.getPlayerId();
  }
  public getPlayerData(): PlayerData {
    return this.playerRepository.getPlayerData();
  }
  public completeMap(mapId: string): void {
    this.logger.info(`Map ${mapId} completed`);
    const defeatedMaps = this.playerRepository.getPlayerData().defeatedMaps;
    if (defeatedMaps.indexOf(mapId) === -1) {
      defeatedMaps.push(mapId);
    }
  }
  public completeTowerMap(level: number): void {
    this.logger.info(`Tower map ${level} completed`);
    const playerData = this.playerRepository.getPlayerData();
    if (level > playerData.lastDefeatedTowerMap) {
      playerData.lastDefeatedTowerMap = level;
    }
  }
  public addMonster(monster: Monster): void {
    monster.ownerId = this.getPlayerId();
    this.playerRepository.addMonster(monster);
  }
  public updateMonster(monster: Monster): void {
    this.playerRepository.updateMonster(monster);
  }
  public getPlayerMonsters(): MonsterData[] {
    return this.getPlayerData().monsters;
  }
}
