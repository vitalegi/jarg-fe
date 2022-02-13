import Monster from "@/game-engine/model/monster/Monster";
import Container from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import GameLoop from "@/game-engine/GameLoop";
import FormulaService from "@/game-engine/ability/FormulaService";
import MapRepository from "@/game-engine/map/MapRepository";
import BattleService from "@/game-engine/battle/BattleService";
import PlayerService from "@/game-engine/PlayerService";
import HistoryRepository from "@/game-engine/battle/turns/HistoryRepository";
import AbilityNameDrawer from "@/game-engine/ui/AbilityNameDrawer";

export default class MonsterCatch {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.MonsterCatch");
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected formulaService = Container.get<FormulaService>(FormulaService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected battleService = Container.get<BattleService>(BattleService);
  protected playerService = Container.get<PlayerService>(PlayerService);
  protected historyRepository =
    Container.get<HistoryRepository>(HistoryRepository);
  protected source;
  protected targetId;

  public constructor(source: Monster, targetId: string) {
    this.source = source;
    this.targetId = targetId;
  }

  public async execute(): Promise<void> {
    this.logger.debug(`${this.source.uuid} tries to catch ${this.targetId}`);
    const target = this.mapRepository.getMonsterById(this.targetId);

    const isCatched = this.formulaService.catch(target);
    this.historyRepository.catchMonster();
    if (isCatched) {
      await this.doCatchSuccess(target);
    } else {
      await this.doCatchFailure();
    }
  }

  protected async doCatchSuccess(target: Monster): Promise<void> {
    const drawer = new AbilityNameDrawer(gameLabel("catch-success"));
    this.gameLoop.addGameLoopHandler(drawer);
    await drawer.notifyWhenCompleted();
    this.logger.info(
      `Catch of ${this.targetId} is done, remove monster from battle and add it to player's monsters`
    );
    this.battleService.removeMonster(this.targetId);
    this.playerService.addMonster(target);
  }
  protected async doCatchFailure(): Promise<void> {
    const drawer = new AbilityNameDrawer(gameLabel("catch-failure"));
    this.gameLoop.addGameLoopHandler(drawer);
    await drawer.notifyWhenCompleted();
  }
}
