import Monster from "@/game-engine/monster/Monster";
import { Service } from "typedi";
import PlayerData from "../PlayerData";

@Service()
export default class PlayerRepository {
  protected playerData: PlayerData | null = null;

  public setPlayerData(playerData: PlayerData): void {
    this.playerData = playerData;
  }

  public getPlayerId(): string {
    return this.getPlayerData().playerId;
  }
  public getMonsters(): Monster[] {
    return this.getPlayerData().monsters;
  }

  protected getPlayerData(): PlayerData {
    if (this.playerData) {
      return this.playerData;
    }
    throw Error(`PlayerData not initialized`);
  }
}
