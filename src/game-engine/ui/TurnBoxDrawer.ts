import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import WindowSizeProxy from "../WindowSizeProxy";
import FontService from "./FontService";
import MapRepository from "../map/MapRepository";
import LoggerFactory from "@/logger/LoggerFactory";
import Tick from "../battle/turns/Tick";
import Monster from "../monster/Monster";
import TurnManagerEstimator from "../battle/turns/TurnManagerEstimator";

export default class TurnBoxDrawer extends Drawer {
  logger = LoggerFactory.getLogger("GameEngine.UI.TurnBoxDrawer");
  protected static NAME = "TurnBox";

  protected parent: PIXI.Container;
  protected container: PIXI.Container | null = null;
  protected turnManagerEstimator =
    Container.get<TurnManagerEstimator>(TurnManagerEstimator);
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected fontService = Container.get<FontService>(FontService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);

  options = {
    entries: 10,
    style: {
      width: 120,
      y: 4,
      rightMargin: 4,
      menuEntry: {
        height: 20,
        fill: 0xffffff,
        marginLeft: 1,
      },
    },
  };

  public constructor(parent: PIXI.Container) {
    super();
    this.parent = parent;
  }

  public getName(): string {
    return "TurnBoxDrawer";
  }

  protected doDraw(): void {
    const update = this.turnManagerEstimator.changed();
    if (this.container === null) {
      this.container = new PIXI.Container();
      this.container.name = TurnBoxDrawer.NAME;
      this.parent.addChild(this.container);
      this.container.x = this.x();
      this.container.y = this.options.style.y;
    }
    if (this.container.x !== this.x()) {
      this.container.x = this.x();
    }
    if (this.container.y !== this.options.style.y) {
      this.container.y = this.options.style.y;
    }
    if (!update) {
      return;
    }
    const toString = (arr: Tick[]) =>
      arr.map((t) => t.toShortString()).join(", ");

    const turns = this.turnManagerEstimator.estimation();
    this.logger.debug(`Turns have changed: ${toString(turns)}`);

    // regenerate entries
    this.container.removeChildren();
    this.container.height = this.height(turns);
    turns
      .map((tick: Tick, index: number) =>
        this.createTurnEntry(tick.monster, index)
      )
      .forEach((turn) => this.container?.addChild(turn));
  }

  protected createTurnEntry(
    monster: Monster,
    index: number
  ): PIXI.DisplayObject {
    let label = "unknown";
    if (monster !== undefined) {
      label = monster.name;
    }

    const entry = new PIXI.Text(label, this.fontService.turnBox());
    entry.x = this.options.style.menuEntry.marginLeft;
    entry.y = this.options.style.menuEntry.height * index;
    return entry;
  }
  protected x(): number {
    return (
      this.windowSizeProxy.width() -
      this.options.style.rightMargin -
      this.options.style.width
    );
  }

  protected height(turns: Tick[]): number {
    return this.options.style.menuEntry.height * turns.length;
  }
}
