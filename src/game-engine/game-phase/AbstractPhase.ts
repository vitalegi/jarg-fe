import Container from "typedi";
import GameApp from "../GameApp";
import * as PIXI from "pixi.js";
import GameAppDataLoader from "../GameAppDataLoader";

export default abstract class AbstractPhase<E> {
  private _gameApp = Container.get<GameApp>(GameApp);
  private _gameAppDataLoader =
    Container.get<GameAppDataLoader>(GameAppDataLoader);

  public async start(options: E | null = null): Promise<void> {
    console.log(`${this.getName()} start`);
    this.reset();

    await this.doStart(options);
    console.log(`${this.getName()} started`);
  }

  protected abstract doStart(options: E | null): Promise<void>;

  public abstract getName(): string;

  protected getApp(): PIXI.Application {
    return this._gameApp.getApp();
  }

  protected getGameAppDataLoader(): GameAppDataLoader {
    return this._gameAppDataLoader;
  }

  protected reset(): void {
    this.getApp().stage.removeChildren();
    this.getApp().stage.removeAllListeners();
  }
}
