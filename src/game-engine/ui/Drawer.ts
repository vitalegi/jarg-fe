import TimeUtil from "@/utils/TimeUtil";
import UuidUtil from "@/utils/UuidUtil";
import Container from "typedi";
import WindowSizeProxy from "../WindowSizeProxy";

class IsWindowSizeChanged {
  protected _lastWidth = 0;
  protected _lastHeight = 0;

  public isChanged(): boolean {
    const windowSize = Container.get<WindowSizeProxy>(WindowSizeProxy);
    const width = windowSize.width();
    const height = windowSize.height();

    const diffW = width - this._lastWidth;
    const diffH = height - this._lastHeight;
    this._lastWidth = width;
    this._lastHeight = height;
    return diffW * diffW + diffH * diffH > 1;
  }
}

export default abstract class Drawer {
  private _id;
  private _completed = false;
  private _drawCount = 0;
  private _startTime = 0;

  private _promises: ((value: void | PromiseLike<void>) => void)[] = [];
  private _isResized = new IsWindowSizeChanged();

  public constructor() {
    this._id = UuidUtil.nextId();
  }

  public notifyWhenCompleted(): Promise<void> {
    return new Promise<void>((resolve) => {
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

  protected complete(): void {
    this._completed = true;
    this._promises.forEach((promise) => promise());
  }

  protected isResized(): boolean {
    return this._isResized.isChanged();
  }
}
