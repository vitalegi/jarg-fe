export class SpriteType {
  public static ANIMATED = "ANIMATED";
  public static STATIC = "STATIC";
}

export default class SpriteConfig {
  name = "";
  type = SpriteType.ANIMATED;
  sprites: string[] = [];
  walkable = false;
  swimmable = false;

  public static create(sprite: any): SpriteConfig {
    const out = new SpriteConfig();
    out.name = sprite.name;
    out.type = sprite.type;
    out.sprites = sprite.sprites;
    out.walkable = sprite.walkable;
    out.swimmable = sprite.swimmable;
    return out;
  }
}
