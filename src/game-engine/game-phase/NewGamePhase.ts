import GameAssetService from "@/services/GameAssetService";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import PlayerData from "../PlayerData";
import MonsterIndexService from "../monster/MonsterIndexService";
import MonsterService from "../monster/MonsterService";
import PlayerRepository from "../repositories/PlayerRepository";
import LeftMenu, { MenuEntry } from "../ui/LeftMenu";
import AbstractPhase from "./AbstractPhase";
import MonsterIndex from "../monster/MonsterIndex";
import MapService from "../map/MapService";
import { LevelUpService } from "../monster/LevelUpService";
import SelectNextBattlePhase from "./SelectNextBattlePhase";
import LoggerFactory from "@/logger/LoggerFactory";
import AbilityService from "../monster-action/ability/AbilityService";
import PhaseService from "./PhaseService";

const starters = ["001", "004", "007"];
const firstMap = "map1";

@Service()
export default class NewGamePhase extends AbstractPhase<never> {
  logger = LoggerFactory.getLogger("GameEngine.GamePhase.NewGamePhase");

  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected playerRepository =
    Container.get<PlayerRepository>(PlayerRepository);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected mapService = Container.get<MapService>(MapService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected selectNextBattlePhase = Container.get<SelectNextBattlePhase>(
    SelectNextBattlePhase
  );
  protected abilityService = Container.get<AbilityService>(AbilityService);
  protected phaseService = Container.get<PhaseService>(PhaseService);

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
    this.logger.info(`Chosen: ${starter.monsterId} - ${starter.name}`);

    const playerData = new PlayerData();
    playerData.playerId = UuidUtil.nextId();

    const monster = this.monsterService.createMonster(
      playerData.playerId,
      starter.monsterId
    );
    await this.levelUpService.levelUps(monster, 5, true);
    this.abilityService
      .getNewLearnableAbilities(monster)
      .forEach((a) => this.abilityService.learnAbility(monster, a.abilityId));

    playerData.monsters.push(monster);
    this.playerRepository.setPlayerData(playerData);

    this.phaseService.goToSelectNextBattle();
  }
}
