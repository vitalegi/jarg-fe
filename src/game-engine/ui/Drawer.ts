import * as PIXI from "pixi.js";
import TimeUtil from "@/utils/TimeUtil";
import UuidUtil from "@/utils/UuidUtil";
import Container from "typedi";
import ScreenProxy from "@/game-engine/ScreenProxy";

// TODO delete and use standard WindowProxy
class IsWindowSizeChanged {
  protected screenProxy = Container.get(ScreenProxy);
  protected _lastWidth = 0;
  protected _lastHeight = 0;

  public isChanged(): boolean {
    const screenProxy = Container.get(ScreenProxy);
    const width = screenProxy.width();
    const height = screenProxy.height();

    const diffW = width - this._lastWidth;
    const diffH = height - this._lastHeight;
    this._lastWidth = width;
    this._lastHeight = height;
    return diffW * diffW + diffH * diffH > 1;
  }
}

export default abstract class Drawer {
  protected screenProxy = Container.get(ScreenProxy);
  private _isResized = new IsWindowSizeChanged();

  private _id;
  private _completed = false;
  private _drawCount = 0;
  private _startTime = 0;

  private _promises: ((value: any | PromiseLike<any>) => void)[] = [];

  public constructor() {
    this._id = UuidUtil.nextId();
  }

  public notifyWhenCompleted(): Promise<any> {
    return new Promise<any>((resolve) => {
      this._promises.push(resolve);
    });
  }

  public draw(): void {
    if (this.isFirstDraw()) {
      this._startTime = TimeUtil.timestamp();
    }
    this.doDraw();
    this._drawCount++;
  }

  protected abstract doDraw(): void;

  public isFirstDraw(): boolean {
    return this._drawCount === 0;
  }

  public completed(): boolean {
    return this._completed;
  }

  public getId(): string {
    return this._id;
  }

  public abstract getName(): string;

  public startTime(): number {
    return this._startTime;
  }

  protected complete(payload: any | undefined = undefined): void {
    this._completed = true;
    this._promises.forEach((promise) => promise(payload));
  }

  protected isResized(): boolean {
    return this._isResized.isChanged();
  }
  protected findChildContainer(
    parent: PIXI.Container,
    name: string
  ): PIXI.Container | null {
    const child = parent.getChildByName(name);
    if (child) {
      return child as PIXI.Container;
    }
    return null;
  }
}
