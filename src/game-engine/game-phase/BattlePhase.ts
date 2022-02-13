import * as PIXI from "pixi.js";
import GameAssetService from "@/services/GameAssetService";
import RendererService from "@/services/RendererService";
import Container, { Service } from "typedi";
import GameLoop from "@/game-engine/GameLoop";
import MapContainer from "@/game-engine/model/map/MapContainer";
import AbstractPhase from "@/game-engine/game-phase/AbstractPhase";
import GameApp from "@/game-engine/GameApp";
import MapRepository from "@/game-engine/map/MapRepository";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import PlayerService from "@/game-engine/PlayerService";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import TileRepository from "@/game-engine/repositories/TileRepository";
import BattleService from "@/game-engine/battle/BattleService";
import DragScreenUserActionHandler from "@/game-engine/user-action-handler/DragScreenUserActionHandler";
import CharacterStatsUserActionHandler from "@/game-engine/user-action-handler/CharacterStatsUserActionHandler";
import MonsterAnimationDrawer from "@/game-engine/ui/MonsterAnimationDrawer";
import TurnBoxDrawer from "@/game-engine/ui/TurnBoxDrawer";
import TurnManager from "@/game-engine/battle/turns/TurnManager";
import HistoryRepository from "@/game-engine/battle/turns/HistoryRepository";

interface Map {
  id: string;
  map: MapContainer;
  onWin: () => Promise<void>;
  onLoss: () => Promise<void>;
}

@Service()
export default class BattlePhase extends AbstractPhase<Map> {
  protected gameApp = Container.get<GameApp>(GameApp);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected playerService = Container.get<PlayerService>(PlayerService);
  protected rendererService = Container.get<RendererService>(RendererService);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected historyRepository =
    Container.get<HistoryRepository>(HistoryRepository);
  protected battleService = Container.get<BattleService>(BattleService);
  protected tileRepository = Container.get<TileRepository>(TileRepository);

  public getName(): string {
    return "BattlePhase";
  }
  protected async doStart(options: Map | null): Promise<void> {
    if (!options) {
      throw Error(`Options undefined.`);
    }
    if (!options.map) {
      throw Error(`Map is null`);
    }
    if (!options.id) {
      throw Error(`ID is null`);
    }
    if (!options.onWin) {
      throw Error(`onWin is null`);
    }
    if (!options.onLoss) {
      throw Error(`onLoss is null`);
    }
    const map = options.map;
    const id = options.id;
    const onWin = options.onWin;
    const onLoss = options.onLoss;
    this.mapRepository.setMap(map, id, onWin, onLoss);

    await this.getGameAppDataLoader().loadMonsters();

    const requiredMonsterIds = map.monsters.map((m) => m.modelId);
    const requiredSprites =
      this.monsterIndexService.getMonsters(requiredMonsterIds);

    await this.getGameAppDataLoader().loadMonstersSpriteSheets(requiredSprites);
    await this.getGameAppDataLoader().loadSpriteConfigs();
    const requiredTiles = this.tileRepository.getTiles(map);
    await this.getGameAppDataLoader().loadTiles(requiredTiles);

    this.userActionService.removeAll();
    this.userActionService.addActionHandler(new DragScreenUserActionHandler());
    this.userActionService.addActionHandler(
      new CharacterStatsUserActionHandler()
    );

    this.gameLoop.removeAll();
    this.gameLoop.addGameLoopHandler(new MonsterAnimationDrawer());

    const container = new PIXI.Container();
    container.name = "BATTLE_CONTAINER";
    this.getApp().stage.addChild(container);

    this.mapRepository
      .getMap()
      .tiles.forEach((tile) =>
        this.rendererService.addMapTile(this.gameApp.getBattleContainer(), tile)
      );

    map.monsters.forEach((monster) => {
      const monsterFamily = this.monsterIndexService.getMonster(
        monster.modelId
      );

      const sprite = this.rendererService.createMonsterContainer(
        monster,
        monsterFamily,
        "normal"
      );

      this.gameApp.getBattleContainer().addChild(sprite);
      const handler = this.gameLoop.getMonsterAnimationDrawer();
      handler.addMonster(
        monster.uuid,
        this.monsterIndexService.getMonster(monster.modelId),
        this.rendererService.getMonsterSprite(sprite),
        "normal"
      );
    });

    this.turnManager.removeAll();
    this.historyRepository.removeAll();
    this.turnManager.addCharacters(this.mapRepository.getMap().monsters);
    this.turnManager.initTurns();
    this.gameLoop.addGameLoopHandler(new TurnBoxDrawer(this.getApp().stage));

    this.battleService.startCharacterTurn();

    this.getApp().ticker.add(() => this.gameLoop.gameLoop());
  }
}
