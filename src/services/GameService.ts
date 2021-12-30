import { Service } from "typedi";
import * as PIXI from "pixi.js";
import RendererService from "@/services/RendererService";
import GameAssetService from "@/services/GameAssetService";
import MonsterService from "@/game-engine/monster/MonsterService";
import PlayerService from "@/game-engine/PlayerService";
import Container from "typedi";
import MapContainer, { Tile } from "@/models/Map";
import { SpriteType } from "@/models/SpriteConfig";
import { Monster } from "@/models/Character";
import UserActionService from "./UserActionService";
import CoordinateService from "../game-engine/CoordinateService";
import Point from "@/models/Point";
import LeftMenu from "@/game-engine/ui/LeftMenu";
import TurnManager from "@/game-engine/turns/TurnManager";
import MonsterAI from "@/game-engine/monster-action/ai/MonsterAI";
import MonsterActionMenuBuilder from "@/game-engine/monster-action/ui/MonsterActionMenuBuilder";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";
import Drawer from "@/game-engine/ui/Drawer";

@Service()
export default class GameService {
  protected lastUserAction = 0;

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

  protected map = new MapContainer();
  protected app: PIXI.Application | null = null;
  protected turnManager = new TurnManager();
  protected leftMenu: LeftMenu | null = null;
  protected gameLoopHandlers: Drawer[] = [];

  public getMap(): MapContainer {
    return this.map;
  }
  public getApp(): PIXI.Application {
    if (this.app) {
      return this.app;
    }
    throw new Error("App not initialized");
  }

  public async init(): Promise<void> {
    this.app = new PIXI.Application({
      autoDensity: true,
    });
    this.app.renderer.view.style.position = "absolute";
    this.app.renderer.view.style.display = "block";
    this.app.resizeTo = window;

    this.map = await this.gameAssetService.getMap("map1");
    this.monsterIndexRepository.init(
      await this.gameAssetService.getMonstersData()
    );
    this.rendererService
      .loadAssets(this.map, this.monsterIndexRepository.getMonsters())
      .then(() => {
        const container = new PIXI.Container();
        container.name = "BATTLE_CONTAINER";
        this.app?.stage.addChild(container);

        this.map.tiles.forEach((tile) => this.initMapTile(tile));

        this.map.monsters.push(...this.playerService.getMonsters());

        const newEnemy = (x: number, y: number) => {
          const enemy = this.monsterService.createMonster(null);
          enemy.coordinates = new Point(x, y);
          this.map.monsters.push(enemy);
        };
        newEnemy(7, 8);
        newEnemy(8, 8);
        newEnemy(9, 8);

        Container.get<LevelUpService>(LevelUpService).gainExperience(
          this.playerService.getMonsters()[0],
          10000
        );

        this.map.monsters.forEach((monster) => {
          const sprite = this.monsterService.createMonsterSprite(
            monster,
            this.map.options
          );
          this.getBattleContainer()?.addChild(sprite);
        });
        this.turnManager.addCharacters(this.map.monsters);
        this.turnManager.initTurns();
        this.startCharacterTurn();

        this.getApp().ticker.add(() => this.gameLoop());
      });
  }

  public getMonstersInBattle(): Monster[] {
    return this.getMap().monsters;
  }
  public getMonsterById(uuid: string): Monster {
    return this.getMap().monsters.filter((m) => m.uuid === uuid)[0];
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

  public isGameOver(playerId: string | null): boolean {
    return (
      this.getMonstersInBattle().filter((m) => m.ownerId === playerId)
        .length === 0
    );
  }

  public die(uuid: string): Promise<void> {
    const monster = this.getMonsterById(uuid);

    return new Promise<void>((resolve) => {
      console.log(`Monster ${monster.uuid} died.`);

      const container = this.getBattleContainer().getChildByName(monster.uuid);
      this.getBattleContainer().removeChild(container);

      this.map.monsters = this.map.monsters.filter(
        (m) => m.uuid !== monster.uuid
      );
      this.turnManager.removeCharacter(uuid);
      resolve();
    });
  }

  public nextTurn() {
    const activeCharacter = this.turnManager.activeCharacter();
    const container =
      this.getBattleContainer()?.getChildByName(activeCharacter);
    if (container) {
      const c = container as PIXI.Container;
      const element = c.getChildByName("activeCharacter");
      c.removeChild(element);
    }

    this.turnManager.next();

    if (this.isGameOver(this.playerService.getPlayerId())) {
      console.log(`Player is defeated, end.`);
    } else {
      // async action, completion is not monitored
      this.startCharacterTurn();
    }
  }

  protected gameLoop(): void {
    this.gameLoopHandlers
      .filter((h) => !h.completed())
      .forEach((h) => {
        try {
          h.draw();
        } catch (e) {
          console.error(e);
        }
      });
    this.gameLoopHandlers = this.gameLoopHandlers.filter((h) => !h.completed());
  }
  protected initMapTile(tile: Tile): void {
    const spriteConfig = this.gameAssetService.getMapSprite(
      this.map,
      tile.spriteModel
    );
    let sprite = null;
    if (spriteConfig.type === SpriteType.ANIMATED) {
      sprite = this.rendererService.createAnimatedSprite(spriteConfig.sprites);
    } else {
      throw new Error(`Unknown type ${spriteConfig.type}`);
    }
    sprite.width = this.map.options.tileWidth;
    sprite.height = this.map.options.tileHeight;

    this.coordinateService.setTileCoordinates(
      sprite,
      tile.coordinates,
      this.map
    );

    this.userActionService.initMapTile(tile.coordinates, sprite);

    this.getBattleContainer()?.addChild(sprite);
  }

  protected async startCharacterTurn(): Promise<void> {
    this.leftMenu?.destroy();
    this.leftMenu = null;

    if (!this.turnManager.hasCharacters()) {
      console.log("No active users, do nothing");
      return;
    }
    const uuid = this.turnManager.activeCharacter();
    const monster = this.getMonsterById(uuid);
    const playerId = this.playerService.getPlayerId();

    if (playerId === monster.ownerId) {
      await this.startPlayerTurn(monster);
    } else {
      await this.startNpcTurn(monster);
    }
  }

  protected async startPlayerTurn(monster: Monster): Promise<void> {
    console.log(`Monster ${monster.uuid} is owned by player, show menu`);
    this.leftMenu = this.monsterActionMenuBuilder.build(monster);
    this.leftMenu.draw();

    const container = this.getBattleContainer()?.getChildByName(monster.uuid);
    if (container) {
      const c = container as PIXI.Container;

      const background = new PIXI.Graphics();
      background.lineStyle({ width: 2, color: 0xff0000, alpha: 0.9 });

      const width = this.map.options.tileWidth;
      const height = this.map.options.tileHeight;
      background.drawEllipse(width / 2, height - 12, width / 4, 4);
      background.endFill();
      background.name = "activeCharacter";

      c.addChildAt(background, 0);
    }
  }

  protected async startNpcTurn(monster: Monster): Promise<void> {
    console.log(`Monster ${monster.uuid} is managed by AI, perform action`);
    const ai = new MonsterAI(monster);
    await ai.execute();
    console.log(`Monster action is completed, go to next.`);
    this.nextTurn();
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

  public addGameLoopHandler(drawer: Drawer): void {
    this.gameLoopHandlers.push(drawer);
  }
}
