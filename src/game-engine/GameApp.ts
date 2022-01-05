import * as PIXI from "pixi.js";
import Container, { Service } from "typedi";
import WindowSizeProxy from "./WindowSizeProxy";

@Service()
export default class GameApp {
  protected app: PIXI.Application | null = null;
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);

  public init(): void {
    this.app = new PIXI.Application({
      autoDensity: true,
    });
    this.windowSizeProxy.setApp(this.app);

    this.app.renderer.view.style.position = "absolute";
    this.app.renderer.view.style.display = "block";
    this.app.resizeTo = window;
  }

  public getApp(): PIXI.Application {
    if (this.app) {
      return this.app;
    }
    throw Error("App not initialized");
  }
}
