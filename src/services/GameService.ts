import { Service } from "typedi";
import * as PIXI from "pixi.js";
import RendererService from "@/services/RendererService";
import GameAssetService from "@/services/GameAssetService";
import MonsterService from "@/game-engine/monster/MonsterService";
import PlayerService from "@/game-engine/PlayerService";
import Container from "typedi";
import MapContainer, { Tile } from "@/models/Map";
import { SpriteType } from "@/models/SpriteConfig";
import { Monster, MonsterIndex } from "@/models/Character";
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
  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);

  protected map = new MapContainer();
  protected app: PIXI.Application | null = null;
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected leftMenu: LeftMenu | null = null;
  protected gameLoop = Container.get<GameLoop>(GameLoop);

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
    this.windowSizeProxy.setApp(this.app);

    this.app.renderer.view.style.position = "absolute";
    this.app.renderer.view.style.display = "block";
    this.app.resizeTo = window;

    this.map = await this.gameAssetService.getMap("map1");
    this.monsterIndexRepository.init(
      await this.gameAssetService.getMonstersData()
    );

    console.log("Load animations' metadata");
    const monsters = this.monsterIndexRepository.getMonsters();
    const promises: Promise<void>[] = [];
    for (const monster of monsters) {
      for (const animationSrc of monster.animationsSrc) {
        promises.push(this.loadAnimationMetadata(monster, animationSrc));
      }
    }
    await Promise.all(promises);
    console.log("Load animations' metadata done.");

    this.abilityRepository.init(await this.gameAssetService.getAbilitiesData());

    this.rendererService
      .loadAssets(this.map, this.monsterIndexRepository.getMonsters())
      .then(() => {
        this.userActionService.addActionHandler(
          new DragScreenUserActionHandler()
        );
        this.userActionService.addActionHandler(
          new CharacterStatsUserActionHandler()
        );
        this.gameLoop.addGameLoopHandler(new MonsterAnimationDrawer());

        const container = new PIXI.Container();
        container.name = "BATTLE_CONTAINER";
        this.app?.stage.addChild(container);

        this.map.tiles.forEach((tile) => this.initMapTile(tile));

        this.map.monsters.push(...this.playerService.getMonsters());

        this.initDummyBattle().then(() => {
          this.map.monsters.forEach((monster) => {
            const sprite = this.monsterService.createMonsterSprite(
              monster,
              this.map.options
            );
            this.getBattleContainer()?.addChild(sprite);
            const handler = this.gameLoop.getMonsterAnimationDrawer();
            handler.addMonster(
              monster.uuid,
              this.monsterIndexRepository.getMonster(monster.modelId),
              this.monsterService.getMonsterSprite(sprite),
              "normal"
            );
          });
          this.turnManager.addCharacters(this.map.monsters);
          this.turnManager.initTurns();
          this.gameLoop.addGameLoopHandler(
            new TurnBoxDrawer(this.getApp().stage, this.map)
          );
          this.startCharacterTurn();

          this.getApp().ticker.add(() => this.gameLoop.gameLoop());
        });
      });
  }

  protected async initDummyBattle(): Promise<void> {
    const newEnemy = (x: number, y: number) => {
      const enemy = this.monsterService.createMonster(null);
      enemy.coordinates = new Point(x, y);
      this.map.monsters.push(enemy);
    };
    newEnemy(3, 3);
    newEnemy(4, 3);
    newEnemy(5, 3);

    const levelUpService = Container.get<LevelUpService>(LevelUpService);
    const randomService = Container.get<RandomService>(RandomService);

    for (let i = 0; i < this.map.monsters.length; i++) {
      await levelUpService.gainExperience(
        this.map.monsters[i],
        5000 + randomService.randomInt(5000)
      );
    }
    await levelUpService.gainExperience(this.map.monsters[0], 50000);
    this.map.monsters.forEach((m) => {
      m.stats.hp = m.stats.maxHP;
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

      this.gameLoop.getMonsterAnimationDrawer().removeMonster(monster.uuid);

      this.getBattleContainer().removeChild(container);

      this.map.monsters = this.map.monsters.filter(
        (m) => m.uuid !== monster.uuid
      );
      this.turnManager.removeCharacter(uuid);
      resolve();
    });
  }

  public nextTurn(): void {
    const activeCharacter = this.turnManager.activeCharacter();
    if (activeCharacter) {
      const container = this.getBattleContainer()?.getChildByName(
        activeCharacter.monster.uuid
      );
      if (container) {
        const c = container as PIXI.Container;
        const element = c.getChildByName("activeCharacter");
        c.removeChild(element);
      }
    }

    this.turnManager.next();

    if (this.isGameOver(this.playerService.getPlayerId())) {
      console.log(`Player is defeated, end.`);
    } else {
      // async action, completion is not monitored
      this.startCharacterTurn();
    }
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
    sprite.name = `${tile.coordinates.x}_${tile.coordinates.y}`;
    sprite.width = this.map.options.tileWidth;
    sprite.height = this.map.options.tileHeight;

    this.coordinateService.setTileCoordinates(
      sprite,
      tile.coordinates,
      this.map
    );

    const coordinates = this.coordinateService.getTileCoordinates(
      tile.coordinates,
      this.map.options
    );
    const border = new PIXI.Graphics();
    border.lineStyle({ width: 1, color: 0x000000 });
    const x1 = coordinates.x;
    const x2 = coordinates.x + this.map.options.tileWidth;
    const y1 = coordinates.y;
    const y2 = coordinates.y + this.map.options.tileHeight - 1;
    border.moveTo(x1, y1);
    border.lineTo(x1, y2);
    border.lineTo(x2, y2);
    border.lineTo(x2, y1);
    border.moveTo(x1, y1);

    this.userActionService.initMapTile(tile.coordinates, sprite);

    this.getBattleContainer()?.addChild(sprite);
    this.getBattleContainer()?.addChild(border);
  }

  protected async startCharacterTurn(): Promise<void> {
    this.leftMenu?.destroy();
    this.leftMenu = null;

    if (!this.turnManager.hasCharacters()) {
      console.log("No active users, do nothing");
      return;
    }
    const active = this.turnManager.activeCharacter();
    if (!active) {
      return;
    }
    const monster = active.monster;

    const playerId = this.playerService.getPlayerId();
    console.log(`Focus on ${monster.coordinates}`);
    if (monster.coordinates) {
      const focus = new ChangeFocusDrawer(monster.coordinates);
      this.gameLoop.addGameLoopHandler(focus);
      await focus.notifyWhenCompleted();
    }
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

  protected async loadAnimationMetadata(
    monster: MonsterIndex,
    animationSrc: AnimationSrc
  ): Promise<void> {
    const animation = await this.gameAssetService.getAnimationMetadata(
      animationSrc.key,
      animationSrc.metadata
    );
    monster.animations.push(animation);
    console.log(
      `Loaded animation metadata for ${monster.name}, ${animationSrc.key}`
    );
  }
}
