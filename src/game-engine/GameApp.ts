import * as PIXI from "pixi.js";
import Container, { Service } from "typedi";
import WindowSizeProxy from "./WindowSizeProxy";

@Service()
export default class GameApp {
  protected app: PIXI.Application | null = null;
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);

  public init(): void {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: 1,
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

  public getBattleContainer(): PIXI.Container {
    return this.getApp().stage.getChildByName(
      "BATTLE_CONTAINER"
    ) as PIXI.Container;
  }
}
