export default class StringUtil {
  public static leftPad(str: string, len: number, char: string): string {
    while (str.length < len) {
      str = char + str;
    }
    return str;
  }
  public static isNullOrEmpty(str: string): boolean {
    if (str === null || str === undefined) {
      return true;
    }
    return str.trim() === "";
  }
}
