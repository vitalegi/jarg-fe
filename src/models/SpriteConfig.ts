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

  public static fromJson(sprite: any): SpriteConfig {
    const out = new SpriteConfig();
    out.name = sprite.name;
    out.type = sprite.type;
    out.sprites = sprite.sprites;
    out.walkable = sprite.walkable;
    out.swimmable = sprite.swimmable;
    return out;
  }
  public clone(): SpriteConfig {
    const out = new SpriteConfig();
    out.name = this.name;
    out.type = this.type;
    out.sprites = this.sprites;
    out.walkable = this.walkable;
    out.swimmable = this.swimmable;
    return out;
  }
}
