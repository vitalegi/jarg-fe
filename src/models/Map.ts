import SpriteConfig from "./SpriteConfig";

export class TileOption {
  tileWidth = 0;
  tileHeight = 0;
}

export class Tile {
  sprite = "";
  x = 0;
  y = 0;
}

export default class MapConfig {
  id = "";
  name = "";
  options = new TileOption();
  sprites: SpriteConfig[] = [];
  tiles: Tile[] = [];
}
