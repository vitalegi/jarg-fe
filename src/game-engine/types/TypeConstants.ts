export default class TypeConstants {
  public static NORMAL = "NORMAL";
  public static FIGHTING = "FIGHTING";
  public static FLYING = "FLYING";
  public static POISON = "POISON";
  public static GROUND = "GROUND";
  public static ROCK = "ROCK";
  public static BUG = "BUG";
  public static GHOST = "GHOST";
  public static STEEL = "STEEL";
  public static FIRE = "FIRE";
  public static WATER = "WATER";
  public static GRASS = "GRASS";
  public static ELECTRIC = "ELECTRIC";
  public static PSYCHIC = "PSYCHIC";
  public static ICE = "ICE";
  public static DRAGON = "DRAGON";
  public static DARK = "DARK";

  public static getTypes(): string[] {
    return [
      TypeConstants.NORMAL,
      TypeConstants.FIGHTING,
      TypeConstants.FLYING,
      TypeConstants.POISON,
      TypeConstants.GROUND,
      TypeConstants.ROCK,
      TypeConstants.BUG,
      TypeConstants.GHOST,
      TypeConstants.STEEL,
      TypeConstants.FIRE,
      TypeConstants.WATER,
      TypeConstants.GRASS,
      TypeConstants.ELECTRIC,
      TypeConstants.PSYCHIC,
      TypeConstants.ICE,
      TypeConstants.DRAGON,
      TypeConstants.DARK,
    ];
  }
}
