export default class Type {
  public static WATER = "WATER";
  public static NORMAL = "NORMAL";
  public static FIRE = "FIRE";

  public static getTypes(): string[] {
    return [Type.WATER, Type.NORMAL, Type.FIRE];
  }

  public static validate(type: string): void {
    if (Type.getTypes().indexOf(type) === -1) {
      throw Error(`Type ${type} is not recognized`);
    }
  }
}
