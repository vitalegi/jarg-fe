import MapContainer from "@/game-engine/map/MapContainer";
import MonsterIndex from "@/models/MonsterIndex";
import Point from "@/models/Point";
import GameAssetService from "@/services/GameAssetService";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import PlayerData from "../PlayerData";
import MonsterIndexService from "../monster/MonsterIndexService";
import MonsterService from "../monster/MonsterService";
import PlayerRepository from "../repositories/PlayerRepository";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import BattlePhase from "./BattlePhase";
import HomePhase from "./HomePhase";

const starters = ["001", "004", "007"];

@Service()
export default class NewGamePhase extends AbstractPhase<never> {
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);

  public getName(): string {
    return "NewGamePhase";
  }
  protected async doStart(options: never | null): Promise<void> {
    await this.getGameAppDataLoader().loadMonsters();

    const menu = new LeftMenu();
    for (const starter of starters) {
      menu.addEntry(this.starterEntry(starter));
    }
    menu.draw();
  }

  protected starterEntry(monsterId: string): MenuEntry {
    const monster = this.monsterIndexService.getMonster(monsterId);

    return new MenuEntry(
      monster.name,
      () => this.choose(monster),
      () => true
    );
  }

  protected async choose(starter: MonsterIndex): Promise<void> {
    console.log(`Chosen: ${starter.monsterId} - ${starter.name}`);

    const playerData = new PlayerData();
    playerData.playerId = UuidUtil.nextId();

    const monster = this.monsterService.createMonster(
      playerData.playerId,
      starter.monsterId
    );
    playerData.monsters.push(monster);

    this.playerRepository.setPlayerData(playerData);

    const map = await this.gameAssetService.getMap("map1");
    map.monsters.push(monster);

    this.goToBattlePhase(map);
  }

  protected async goToBattlePhase(map: MapContainer): Promise<void> {
    await Container.get<BattlePhase>(BattlePhase).start(map);
  }
}
