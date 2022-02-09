export default class ObjectUtil {
  public static isNullOrUndefined(o: any): boolean {
    return o === null || o === undefined;
  }
  public static isNotNullOrUndefined(o: any): boolean {
    return o !== null && o !== undefined;
  }
}
