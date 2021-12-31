import MapContainer, { MapOption } from "@/models/Map";
import Point from "@/models/Point";
import { Service } from "typedi";
import * as PIXI from "pixi.js";

@Service()
export default class WindowSizeProxy {
  protected app: PIXI.Application | null = null;

  public setApp(app: PIXI.Application | null): void {
    this.app = app;
  }

  public width(): number {
    if (this.app) {
      return this.app?.view.width;
    }
    throw Error(`App not configured`);
  }
  public height(): number {
    if (this.app) {
      return this.app?.view.height;
    }
    throw Error(`App not configured`);
  }
}
