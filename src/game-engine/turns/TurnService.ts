import * as PIXI from "pixi.js";
import { Monster } from "@/models/Character";
import Container, { Service } from "typedi";
import GameApp from "../GameApp";
import GameLoop from "../GameLoop";
import MonsterActionMenuBuilder from "../monster-action/ui/MonsterActionMenuBuilder";
import PlayerService from "../PlayerService";
import ChangeFocusDrawer from "../ui/ChangeFocusDrawer";
import LeftMenu from "../ui/LeftMenu";
import TurnManager from "./TurnManager";
import MapRepository from "../map/MapRepository";
import MonsterAI from "../monster-action/ai/MonsterAI";

@Service()
export default class TurnService {
  protected gameApp = Container.get<GameApp>(GameApp);
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected playerService = Container.get<PlayerService>(PlayerService);
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected monsterActionMenuBuilder = Container.get<MonsterActionMenuBuilder>(
    MonsterActionMenuBuilder
  );
  protected mapRepository = Container.get<MapRepository>(MapRepository);

  public async startCharacterTurn(): Promise<void> {
    LeftMenu.destroy();

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

    LeftMenu.destroy();
    this.monsterActionMenuBuilder.build(monster).draw();

    const container = this.gameApp
      .getBattleContainer()
      .getChildByName(monster.uuid);
    if (container) {
      const c = container as PIXI.Container;

      const background = new PIXI.Graphics();
      background.lineStyle({ width: 2, color: 0xff0000, alpha: 0.9 });

      const width = this.mapRepository.getMap().options.tileWidth;
      const height = this.mapRepository.getMap().options.tileHeight;
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

  public nextTurn(): void {
    const activeCharacter = this.turnManager.activeCharacter();
    if (activeCharacter) {
      const container = this.gameApp
        .getBattleContainer()
        .getChildByName(activeCharacter.monster.uuid);
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

  public isGameOver(playerId: string | null): boolean {
    return (
      this.getMonstersInBattle().filter((m) => m.ownerId === playerId)
        .length === 0
    );
  }

  public getMonstersInBattle(): Monster[] {
    return this.mapRepository.getMap().monsters;
  }
}
