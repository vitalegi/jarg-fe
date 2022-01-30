export default class NumberUtil {
  public static formatInt(n: number): string {
    return n.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }
  public static isNumber(s: string): boolean {
    return !isNaN(NumberUtil.parse(s));
  }
  public static parse(s: string): number {
    return parseInt(s, 10);
  }

  public static min(
    numbers: number[],
    defaultValue = Number.MAX_SAFE_INTEGER
  ): number {
    return numbers.reduce((prev, curr) => Math.min(prev, curr), defaultValue);
  }
  public static max(numbers: number[], defaultValue = 0): number {
    return numbers.reduce((prev, curr) => Math.max(prev, curr), defaultValue);
  }
  public static sum(numbers: number[]): number {
    return numbers.reduce((prev, curr) => prev + curr, 0);
  }
}
