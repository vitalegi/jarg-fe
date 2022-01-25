import * as PIXI from "pixi.js";
import GameAssetService from "@/services/GameAssetService";
import RendererService from "@/services/RendererService";
import Container, { Service } from "typedi";
import MapContainer from "../map/MapContainer";
import MonsterIndexService from "../monster/MonsterIndexService";
import CharacterStatsUserActionHandler from "../user-action-handler/CharacterStatsUserActionHandler";
import DragScreenUserActionHandler from "../user-action-handler/DragScreenUserActionHandler";
import UserActionService from "../user-action-handler/UserActionService";
import AbstractPhase from "./AbstractPhase";
import GameLoop from "@/game-engine/GameLoop";
import MonsterAnimationDrawer from "../ui/MonsterAnimationDrawer";
import MapRepository from "../map/MapRepository";
import PlayerService from "../PlayerService";
import TurnManager from "../battle/turns/TurnManager";
import TurnBoxDrawer from "../ui/TurnBoxDrawer";
import BattleService from "../battle/BattleService";
import GameApp from "../GameApp";
import HistoryRepository from "../battle/turns/HistoryRepository";

@Service()
export default class BattlePhase extends AbstractPhase<MapContainer> {
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

  public getName(): string {
    return "BattlePhase";
  }
  protected async doStart(map: MapContainer | null): Promise<void> {
    if (!map) {
      throw Error(`Map is null`);
    }
    this.mapRepository.setMap(map);
    await this.getGameAppDataLoader().loadMonsters();

    const requiredMonsterIds = map.monsters.map((m) => m.modelId);
    const requiredSprites =
      this.monsterIndexService.getMonsters(requiredMonsterIds);

    await this.getGameAppDataLoader().loadMonstersSpriteSheets(requiredSprites);

    await this.getGameAppDataLoader().loadTiles(map.sprites);

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

    //this.mapRepository.getMap().monsters.push(...this.playerService.getMonsters());

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
