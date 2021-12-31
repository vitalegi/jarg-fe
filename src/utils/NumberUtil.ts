export default class NumberUtil {
  public static formatInt(n: number): string {
    return n.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }
}
