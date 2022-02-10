import { asBoolean, asString } from "@/utils/JsonUtil";

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
    out.name = asString(sprite.name);
    out.type = asString(sprite.type);
    if (sprite.sprites) {
      out.sprites = sprite.sprites.map(asString);
    }
    out.walkable = asBoolean(sprite.walkable, false);
    out.swimmable = asBoolean(sprite.swimmable, false);
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
