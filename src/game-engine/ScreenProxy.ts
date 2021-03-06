import { Service } from "typedi";
import * as PIXI from "pixi.js";

@Service()
export default class ScreenProxy {
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

  public isLandscapeMode(): boolean {
    return this.width() / this.height() > 1;
  }

  public isSmallScreen(): boolean {
    return this.width() < 800;
  }

  protected update(): void {
    if (this.app) {
      this._width = this.app.view.width;
      this._height = this.app.view.height;
    }
  }
}
