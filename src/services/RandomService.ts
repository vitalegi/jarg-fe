import { Service } from "typedi";

@Service()
export default class RandomService {
  /**
   * Returns a random int in the range [from, to]
   * @param from
   * @param to
   * @returns
   */
  public randomInt(from: number, to: number): number {
    return from + Math.floor((to - from + 1) * Math.random());
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
