import Monster from "@/game-engine/monster/Monster";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import * as PIXI from "pixi.js";
import LoggerFactory from "@/logger/LoggerFactory";
import GameApp from "@/game-engine/GameApp";
import Drawer from "@/game-engine/ui/Drawer";
import FontService from "@/game-engine/ui/FontService";

export default class TextOverCharacterDrawer extends Drawer {
  logger = LoggerFactory.getLogger("GameEngine.UI.TextOverCharacterDrawer");
  protected static NAME = "TextOverCharacterDrawer";
  protected gameApp = Container.get<GameApp>(GameApp);
  protected fontService = Container.get<FontService>(FontService);
  monster;
  text;

  options = {
    duration: 1500,
  };

  public constructor(monster: Monster, text: string) {
    super();
    this.monster = monster;
    this.text = text;
  }

  public getName(): string {
    return "TextOverCharacterDrawer";
  }

  protected doDraw(): void {
    if (this.isFirstDraw()) {
      this.logger.debug(`Show text ${this.getText()}`);
      const container = this.getMonsterContainer();
      if (container) {
        container.addChild(this.createTextMessage());
      }
    }
    if (TimeUtil.timestamp() - this.startTime() >= this.options.duration) {
      this.logger.debug(`Remove text message ${this.getText()}`);
      const container = this.getMonsterContainer();
      if (container) {
        const textChild = container.getChildByName(
          TextOverCharacterDrawer.NAME
        );
        container.removeChild(textChild);
      }
      this.complete();
    }
  }

  protected createTextMessage(): PIXI.Text {
    const message = new PIXI.Text(
      this.getText(),
      this.fontService.textOverCharacter()
    );
    message.name = TextOverCharacterDrawer.NAME;
    message.position.x = 0;
    message.position.y = 0;
    return message;
  }

  protected getText(): string {
    return this.text;
  }

  protected getMonsterContainer(): PIXI.Container | null {
    return this.findChildContainer(
      this.gameApp.getBattleContainer(),
      this.monster.uuid
    );
  }
}
