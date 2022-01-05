import { Monster } from "@/models/Character";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import GameApp from "../GameApp";

export default class TextOverCharacterDrawer extends Drawer {
  protected static NAME = "TextOverCharacterDrawer";
  protected gameApp = Container.get<GameApp>(GameApp);
  monster;
  text;

  options = {
    duration: 1500,
    font: {
      fontFamily: "Courier",
      fontSize: 16,
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    },
  };

  public static miss(monster: Monster): TextOverCharacterDrawer {
    return new TextOverCharacterDrawer(monster, "MISS");
  }

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
      console.log(`Show text`);
      const container = this.getMonsterContainer();
      if (container) {
        container.addChild(this.createTextMessage());
      }
    }
    if (TimeUtil.timestamp() - this.startTime() >= this.options.duration) {
      console.log(`Remove text message`);
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
    const message = new PIXI.Text(this.getText(), this.options.font);
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
