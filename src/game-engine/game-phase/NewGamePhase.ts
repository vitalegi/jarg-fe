import GameAssetService from "@/services/GameAssetService";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import AbstractPhase from "@/game-engine/game-phase/AbstractPhase";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import PlayerRepository from "@/game-engine/repositories/PlayerRepository";
import MonsterService from "@/game-engine/monster/MonsterService";
import MapService from "@/game-engine/map/MapService";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import SelectNextBattlePhase from "@/game-engine/game-phase/SelectNextBattlePhase";
import AbilityService from "@/game-engine/ability/AbilityService";
import PhaseService from "@/game-engine/game-phase/PhaseService";
import GameLoop from "@/game-engine/GameLoop";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import PlayerData from "@/game-engine/PlayerData";

const starters = ["001", "004", "007"];

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
  protected gameLoop = Container.get<GameLoop>(GameLoop);

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
    this.getApp().ticker.add(() => this.gameLoop.gameLoop());
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

    const monster = await this.monsterService.createMonster(
      playerData.playerId,
      starter.monsterId
    );
    await this.levelUpService.levelUps(monster, 5, true);
    this.abilityService
      .getNewLearnableAbilities(monster)
      .forEach((a) => this.abilityService.learnAbility(monster, a.abilityId));

    this.playerRepository.setPlayerData(playerData);
    this.playerRepository.addMonster(monster);
    this.phaseService.goToSelectNextBattle();
  }
}
