import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";

export default class TextOverCharacterDrawer extends Drawer {
  protected static NAME = "TextOverCharacterDrawer";

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

  protected getName(): string {
    return "TextOverCharacterDrawer";
  }

  public doDraw(): void {
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
    const gameService = Container.get<GameService>(GameService);
    return gameService.findChildContainer(
      gameService.getBattleContainer(),
      this.monster.uuid
    );
  }
}
