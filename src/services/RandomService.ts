import { Service } from "typedi";

@Service()
export default class RandomService {
  /**
   * Returns a random int in the range [0, n)
   * @param n
   * @returns
   */
  public randomInt(n: number): number {
    return Math.floor(n * Math.random());
  }

  /**
   * Returns a random decimal in the range [from, to)
   * @param from
   * @param to
   */
  public randomDecimal(from: number, to: number): number {
    return from + Math.random() * (to - from);
  }
}
