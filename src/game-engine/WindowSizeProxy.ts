import { Service } from "typedi";
import * as PIXI from "pixi.js";

@Service()
export default class WindowSizeProxy {
  protected app: PIXI.Application | null = null;

  protected _width = 0;
  protected _height = 0;

  public constructor() {
    setInterval(() => this.update(), 100);
  }

  public setApp(app: PIXI.Application | null): void {
    this.app = app;
    this.update();
  }

  public width(): number {
    return this._width;
  }
  public height(): number {
    return this._height;
  }

  protected update(): void {
    if (this.app) {
      this._width = this.app.view.width;
      this._height = this.app.view.height;
    }
  }
}
