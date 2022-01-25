import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import TurnManager from "../battle/turns/TurnManager";
import MapContainer from "@/game-engine/map/MapContainer";
import WindowSizeProxy from "../WindowSizeProxy";
import FontService from "./FontService";
import MapRepository from "../map/MapRepository";
import LoggerFactory from "@/logger/LoggerFactory";
import Tick from "../battle/turns/Tick";
import Monster from "../monster/Monster";

export default class TurnBoxDrawer extends Drawer {
  logger = LoggerFactory.getLogger("GameEngine.UI.TurnBoxDrawer");
  protected static NAME = "TurnBox";

  protected parent: PIXI.Container;
  protected container: PIXI.Container | null = null;
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected fontService = Container.get<FontService>(FontService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);

  //TODO move in a Repository class
  protected turns: Tick[] = [];

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
    const newTurns = this.getTurns();
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

    if (!this.turnsChanged(this.turns, newTurns)) {
      return;
    }
    const toString = (arr: Tick[]) =>
      arr.map((t) => t.toShortString()).join(", ");

    this.logger.debug(
      `Turns have changed from ${toString(this.turns)} to ${toString(newTurns)}`
    );
    this.turnManager.reportTicksStatus(newTurns);

    // regenerate entries
    this.container.removeChildren();
    this.container.height = this.height(newTurns);
    this.turns = newTurns;
    this.turns
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

  protected getTurns(): Tick[] {
    return this.turnManager.getTurns(10);
  }

  protected turnsChanged(oldTurns: Tick[], newTurns: Tick[]): boolean {
    if (oldTurns.length !== newTurns.length) {
      return true;
    }
    for (let i = 0; i < oldTurns.length; i++) {
      if (oldTurns[i].monster.uuid !== newTurns[i].monster.uuid) {
        return true;
      }
    }
    return false;
  }

  protected height(turns: Tick[]): number {
    return this.options.style.menuEntry.height * turns.length;
  }
}
