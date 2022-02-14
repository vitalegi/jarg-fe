export default class StringUtil {
  public static leftPad(str: string, len: number, char: string): string {
    while (str.length < len) {
      str = char + str;
    }
    return str;
  }
  public static isNullOrEmpty(str: string | undefined | null): boolean {
    if (str === null || str === undefined) {
      return true;
    }
    return str.trim() === "";
  }

  public static isEmpty(str: string | undefined | null): boolean {
    if (str === undefined) {
      return true;
    }
    return StringUtil.isNullOrEmpty(str) || str === "";
  }
}
