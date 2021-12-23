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
}
