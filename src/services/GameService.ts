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
import {
  PixiSpriteRepository,
  PixiContainerRepository,
  SpritesConstants,
  ContainersConstants,
} from "@/game-engine/repositories/PixiRepository";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";

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
  protected pixiSpriteRepository =
    Container.get<PixiSpriteRepository>(PixiSpriteRepository);
  protected pixiContainerRepository = Container.get<PixiContainerRepository>(
    PixiContainerRepository
  );

  protected monsterIndexRepository = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );

  protected map = new MapContainer();
  protected app: PIXI.Application | null = null;
  protected turnManager = new TurnManager();
  protected leftMenu: LeftMenu | null = null;

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
        this.setBattleContainer(container);
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

      const container = this.pixiContainerRepository.find(
        monster.uuid,
        ContainersConstants.MONSTER
      );
      if (container) {
        this.getBattleContainer()?.removeChild(container);
      }

      this.map.monsters = this.map.monsters.filter(
        (m) => m.uuid !== monster.uuid
      );
      this.turnManager.removeCharacter(uuid);
      resolve();
    });
  }

  public nextTurn() {
    this.turnManager.next();
    // async action, completion is not monitored
    this.startCharacterTurn();
  }

  protected gameLoop(): void {
    const now = +new Date();
    if (now - this.lastUserAction < 100) {
      return;
    }
    this.lastUserAction = now;
  }
  protected initMapTile(tile: Tile): void {
    const spriteConfig = this.gameAssetService.getMapSprite(
      this.map,
      tile.spriteModel
    );
    let sprite = null;
    if (spriteConfig.type === SpriteType.ANIMATED) {
      sprite = this.rendererService.createAnimatedSprite(spriteConfig.sprites);
      this.pixiSpriteRepository.add(
        tile.uuid,
        SpritesConstants.MAP_TILE,
        sprite
      );
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
  }

  protected async startNpcTurn(monster: Monster): Promise<void> {
    console.log(`Monster ${monster.uuid} is managed by AI, perform action`);
    const ai = new MonsterAI(monster);
    await ai.execute();
    console.log(`Monster action is completed, go to next.`);
    this.turnManager.next();
    if (this.isGameOver(this.playerService.getPlayerId())) {
      console.log(`Player is defeated, end.`);
    } else {
      this.startCharacterTurn();
    }
  }

  protected getBattleContainer(): PIXI.Container | null {
    return this.pixiContainerRepository.find("", ContainersConstants.BATTLE);
  }
  protected setBattleContainer(container: PIXI.Container): void {
    this.pixiContainerRepository.add("", ContainersConstants.BATTLE, container);
  }
}
