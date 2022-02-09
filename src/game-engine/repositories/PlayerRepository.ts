import LoggerFactory from "@/logger/LoggerFactory";
import { Service } from "typedi";
import Monster from "../monster/Monster";
import MonsterData from "../monster/MonsterData";
import PlayerData from "../PlayerData";

@Service()
export default class PlayerRepository {
  logger = LoggerFactory.getLogger("GameEngine.Repositories.PlayerRepository");

  protected playerData: PlayerData | null = null;

  public loadAll(): PlayerData[] {
    const value = window.localStorage.getItem("players");
    if (!value) {
      return [];
    }
    const json = JSON.parse(value);
    return json.map(PlayerData.fromJson);
  }

  public load(key: string): PlayerData | null {
    const game = this.loadAll().filter((data) => data.playerId === key);
    if (game.length > 0) {
      return game[0];
    }
    return null;
  }

  public save(playerData: PlayerData): void {
    playerData.lastSaveDate = new Date();
    const games = this.loadAll();
    const index = games.findIndex((v) => v.playerId === playerData.playerId);
    if (index === -1) {
      games.push(playerData);
    } else {
      games[index] = playerData;
    }
    window.localStorage.setItem(
      "players",
      JSON.stringify(games.map((g) => g.toJson()))
    );
    this.logger.info(`Saved status for ${playerData.playerId}`);
  }

  public setPlayerData(playerData: PlayerData): void {
    this.playerData = playerData;
  }

  public getPlayerId(): string {
    return this.getPlayerData().playerId;
  }
  public getPlayerData(): PlayerData {
    if (this.playerData) {
      return this.playerData;
    }
    throw Error(`PlayerData not initialized`);
  }
  public addMonster(monster: Monster): void {
    const m = MonsterData.fromMonster(monster);
    this.getPlayerData().monsters.push(m);
  }
  public updateMonster(monster: Monster): void {
    const monsters = this.getPlayerData().monsters;
    const index = monsters.findIndex((e) => e.uuid === monster.uuid);
    if (index === -1) {
      throw Error(
        `Monster ${monster.uuid} (${
          monster.name
        }) not found in player data. Available: ${monsters
          .map((m) => m.uuid)
          .join(", ")}`
      );
    }
    monsters[index] = MonsterData.fromMonster(monster);
  }
}
