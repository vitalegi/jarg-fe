import Monster from "@/game-engine/model/monster/Monster";
import * as PIXI from "pixi.js";
import Container from "typedi";
import LoggerFactory from "@/logger/LoggerFactory";
import Drawer from "@/game-engine/ui/Drawer";
import FontService from "@/game-engine/ui/graphics/FontService";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";
import ScreenProxy from "@/game-engine/ScreenProxy";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import FrameImpl from "@/game-engine/ui/FrameImpl";
import MonsterIndex from "@/game-engine/model/monster/MonsterIndex";
import TapAnythingUserActionHandler from "@/game-engine/user-action-handler/TapAnythingUserActionHandler";
import GeneralStats from "@/game-engine/ui/monster-info/GeneralStats";
import Abilities from "@/game-engine/ui/monster-info/Abilities";

export default class MonsterInfoDrawer extends Drawer {
  logger = LoggerFactory.getLogger("GameEngine.UI.MonsterInfoDrawer");
  protected static NAME = "MonsterInfoDrawer";

  protected screenProxy = Container.get(ScreenProxy);
  protected fontService = Container.get(FontService);
  protected levelUpService = Container.get(LevelUpService);
  protected abilityRepository = Container.get(AbilityRepository);
  protected userActionService = Container.get(UserActionService);

  protected parent: PIXI.Container;
  protected container: PIXI.Container | null = null;
  protected frame = new FrameImpl();
  protected monster;
  protected monsterIndex;
  protected _height = 0;

  protected options = {
    row: {
      height: 20,
    },
    stats: {
      cols: [{ leftOffset: 5 }, { leftOffset: 85 }],
    },
    abilities: {
      cols: [
        { leftOffset: 255 },
        { leftOffset: 465 },
        { leftOffset: 545 },
        { leftOffset: 620 },
      ],
    },
  };

  public constructor(
    parent: PIXI.Container,
    monster: Monster,
    monsterIndex: MonsterIndex
  ) {
    super();
    this.parent = parent;
    this.monster = monster;
    this.monsterIndex = monsterIndex;
  }

  public getName(): string {
    return "MonsterInfoDrawer";
  }

  protected doDraw(): void {
    if (this.container === null) {
      this.logger.debug(`Show stats of ${this.monster.uuid}`);
      this.container = new PIXI.Container();
      this.container.name = MonsterInfoDrawer.NAME;

      const general = this.createGeneral();
      general.y = this.frame.getWidth() + 4;
      this.container.addChild(general);

      const abilities = this.createAbilities();
      abilities.x = 255;
      abilities.y = this.frame.getWidth() + 4;
      this.container.addChild(abilities);
      this._height = Math.max(
        this._height,
        general.y + general.height,
        abilities.y + abilities.height
      );

      this.logger.debug(
        `x=${this.x()}, y=${this.y()}, width=${this.width()}, height=${this.height()}`
      );

      this.container.x = this.x();
      this.container.y = this.y();

      const frame = this.frame.createFrame(0, 0, this.width(), this.height());
      this.userActionService.initContainer(frame);
      this.container.addChildAt(frame, 0);

      const actionHandler = new TapAnythingUserActionHandler();
      this.userActionService.addActionHandler(actionHandler),
        actionHandler.execute().then(() => {
          if (this.container) {
            this.parent.removeChild(this.container);
          }
          this.complete();
        });
      this.parent.addChild(this.container);
    }

    if (this.isResized()) {
      if (this.container) {
        this.container.x = this.x();
        this.container.y = this.y();
      }
    }
  }

  protected x(): number {
    return (this.screenProxy.width() - this.width()) / 2;
  }

  protected y(): number {
    return (this.screenProxy.height() - this.height()) / 2;
  }

  protected width(): number {
    return 700;
  }

  protected height(): number {
    return this._height;
  }

  protected createGeneral(): PIXI.Container {
    return new GeneralStats(this.monster, this.monsterIndex).create();
  }

  protected createAbilities(): PIXI.Container {
    return new Abilities(this.monster, this.monsterIndex).create();
  }
}
