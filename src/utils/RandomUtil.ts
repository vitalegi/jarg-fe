export default class RandomUtil {
  public static randomInt(n: number): number {
    return Math.round(n * Math.random());
  }
}
