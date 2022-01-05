import { Service } from "typedi";
import * as PIXI from "pixi.js";
import RendererService from "@/services/RendererService";
import GameAssetService from "@/services/GameAssetService";
import MonsterService from "@/game-engine/monster/MonsterService";
import PlayerService from "@/game-engine/PlayerService";
import Container from "typedi";
import MapContainer from "@/game-engine/map/MapContainer";
import { SpriteType } from "@/models/SpriteConfig";
import { Monster } from "@/models/Character";
import MonsterIndex from "@/models/MonsterIndex";
import UserActionService from "../game-engine/user-action-handler/UserActionService";
import CoordinateService from "../game-engine/CoordinateService";
import Point from "@/models/Point";
import LeftMenu from "@/game-engine/ui/LeftMenu";
import TurnManager from "@/game-engine/turns/TurnManager";
import MonsterAI from "@/game-engine/monster-action/ai/MonsterAI";
import MonsterActionMenuBuilder from "@/game-engine/monster-action/ui/MonsterActionMenuBuilder";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";
import ChangeFocusDrawer from "@/game-engine/ui/ChangeFocusDrawer";
import RandomService from "./RandomService";
import TurnBoxDrawer from "@/game-engine/ui/TurnBoxDrawer";
import WindowSizeProxy from "@/game-engine/WindowSizeProxy";
import DragScreenUserActionHandler from "@/game-engine/user-action-handler/DragScreenUserActionHandler";
import CharacterStatsUserActionHandler from "@/game-engine/user-action-handler/CharacterStatsUserActionHandler";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";
import { AnimationSrc } from "@/models/Animation";
import MonsterAnimationDrawer from "@/game-engine/ui/MonsterAnimationDrawer";
import GameLoop from "@/game-engine/GameLoop";
import TypeRepository from "@/game-engine/repositories/TypeRepository";
import GameApp from "@/game-engine/GameApp";
import GameAppDataLoader from "@/game-engine/GameAppDataLoader";
import Tile from "@/game-engine/map/Tile";
import MapRepository from "@/game-engine/map/MapRepository";
import TurnService from "@/game-engine/turns/TurnService";

@Service()
export default class GameService {
  protected gameApp = Container.get<GameApp>(GameApp);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  private _gameAppDataLoader =
    Container.get<GameAppDataLoader>(GameAppDataLoader);

  protected rendererService = Container.get(RendererService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected playerService = Container.get<PlayerService>(PlayerService);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected monsterActionMenuBuilder = Container.get<MonsterActionMenuBuilder>(
    MonsterActionMenuBuilder
  );

  protected monsterIndexRepository = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );
  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected typeRepository = Container.get<TypeRepository>(TypeRepository);

  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected leftMenu: LeftMenu | null = null;
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected turnService = Container.get<TurnService>(TurnService);

  public getApp(): PIXI.Application {
    return this.gameApp.getApp();
  }

  protected async initDummyBattle(): Promise<void> {
    const newEnemy = (x: number, y: number) => {
      const enemy = this.monsterService.createMonster(null);
      enemy.coordinates = new Point(x, y);
      this.mapRepository.getMap().monsters.push(enemy);
    };
    newEnemy(3, 3);
    newEnemy(4, 3);
    newEnemy(5, 3);

    const levelUpService = Container.get<LevelUpService>(LevelUpService);
    const randomService = Container.get<RandomService>(RandomService);

    for (let i = 0; i < this.mapRepository.getMap().monsters.length; i++) {
      await levelUpService.gainExperience(
        this.mapRepository.getMap().monsters[i],
        5000 + randomService.randomInt(5000)
      );
    }
    await levelUpService.gainExperience(
      this.mapRepository.getMap().monsters[0],
      50000
    );
    this.mapRepository.getMap().monsters.forEach((m) => {
      m.stats.hp = m.stats.maxHP;
    });
  }

  public getMonsterById(uuid: string): Monster {
    return this.mapRepository
      .getMap()
      .monsters.filter((m) => m.uuid === uuid)[0];
  }

  public moveBattleStage(offsetX: number, offsetY: number): void {
    const battleContainer = this.getBattleContainer();
    if (battleContainer) {
      battleContainer.x += offsetX;
      battleContainer.y += offsetY;
    }
  }

  public isDead(uuid: string): boolean {
    const monster = this.getMonsterById(uuid);
    return monster.stats.hp <= 0;
  }

  public die(uuid: string): Promise<void> {
    const monster = this.getMonsterById(uuid);

    return new Promise<void>((resolve) => {
      console.log(`Monster ${monster.uuid} died.`);

      const container = this.getBattleContainer().getChildByName(monster.uuid);

      this.gameLoop.getMonsterAnimationDrawer().removeMonster(monster.uuid);

      this.getBattleContainer().removeChild(container);

      this.mapRepository.getMap().monsters = this.mapRepository
        .getMap()
        .monsters.filter((m) => m.uuid !== monster.uuid);
      this.turnManager.removeCharacter(uuid);
      resolve();
    });
  }

  public getBattleContainer(): PIXI.Container {
    const container = this.getApp().stage.getChildByName("BATTLE_CONTAINER");
    if (container) {
      return container as PIXI.Container;
    }
    throw Error(`Container not found`);
  }

  public getChildContainer(
    parent: PIXI.Container,
    name: string
  ): PIXI.Container {
    const child = this.findChildContainer(parent, name);
    if (child) {
      return child;
    }
    throw Error(
      `Cannot find element ${name} in parent ${
        parent.name
      }. Children ${parent.children.map((c) => c.name).join(", ")}`
    );
  }

  public findChildContainer(
    parent: PIXI.Container,
    name: string
  ): PIXI.Container | null {
    const child = parent.getChildByName(name);
    if (child) {
      return child as PIXI.Container;
    }
    return null;
  }
}
