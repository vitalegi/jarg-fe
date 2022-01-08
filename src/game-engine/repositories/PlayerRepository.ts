import Monster from "@/game-engine/monster/Monster";
import { Service } from "typedi";
import PlayerData from "../PlayerData";

@Service()
export default class PlayerRepository {
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
    const games = this.loadAll();
    const index = games.findIndex((v) => v.playerId === playerData.playerId);
    if (index === -1) {
      games.push(playerData);
    } else {
      games[index] = playerData;
    }
    window.localStorage.setItem("players", JSON.stringify(games));
    console.log(`Saved status for ${playerData.playerId}`);
  }

  public setPlayerData(playerData: PlayerData): void {
    this.playerData = playerData;
  }

  public getPlayerId(): string {
    return this.getPlayerData().playerId;
  }
  public getMonsters(): Monster[] {
    return this.getPlayerData().monsters;
  }
  public getPlayerData(): PlayerData {
    if (this.playerData) {
      return this.playerData;
    }
    throw Error(`PlayerData not initialized`);
  }
}
