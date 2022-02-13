import Container from "typedi";
import * as PIXI from "pixi.js";
import Drawer from "@/game-engine/ui/Drawer";
import CoordinateService from "@/game-engine/CoordinateService";
import GameApp from "@/game-engine/GameApp";
import Tile from "@/game-engine/map/Tile";
import GameConfig from "@/game-engine/GameConfig";

export default class TileFocusableDrawer extends Drawer {
  protected static NAME = "TileFocusableDrawer";
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected gameApp = Container.get<GameApp>(GameApp);

  protected tiles;

  public constructor(tiles: Tile[]) {
    super();
    this.tiles = tiles;
  }

  public getName(): string {
    return "TileFocusableDrawer";
  }

  protected doDraw(): void {
    if (this.isFirstDraw()) {
      this.tiles.forEach((tile) => this.drawTile(tile));
    }
  }

  public remove(): void {
    const battleContainer = this.gameApp.getBattleContainer();
    this.tiles.forEach((tile) => {
      const child = battleContainer.getChildByName(this.tileName(tile));
      battleContainer.removeChild(child);
    });
    this.complete();
  }

  protected drawTile(tile: Tile): void {
    const coordinates = this.coordinateService.getTileCoordinates(
      tile.coordinates
    );

    const border = new PIXI.Graphics();
    border.name = this.tileName(tile);
    const width = 4;
    border.lineStyle({ width: width, color: 0xff0000 });
    const x1 = coordinates.x + width - 1;
    const x2 = coordinates.x + GameConfig.SHARED.tile.width - width;
    const y1 = coordinates.y + width - 1;
    const y2 = coordinates.y + GameConfig.SHARED.tile.height - width;
    border.moveTo(x1, y1);
    border.lineTo(x1, y2);
    border.lineTo(x2, y2);
    border.lineTo(x2, y1);
    border.lineTo(x1, y1);
    border.lineTo(x1, y2);
    this.gameApp.getBattleContainer().addChild(border);
  }

  protected tileName(tile: Tile): string {
    return `${tile.coordinates.x}_${tile.coordinates.y}_FOCUS`;
  }
}
