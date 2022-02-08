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

  public randomBool(lessThen: number): boolean {
    return Math.random() < lessThen;
  }

  public randomElement<E>(arr: E[]): E {
    if (arr.length === 0) {
      throw Error(`Array is empty, can't retrieve random element`);
    }
    return arr[this.randomInt(0, arr.length - 1)];
  }
}
