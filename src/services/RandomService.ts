import { Service } from "typedi";

@Service()
export default class RandomService {
  public randomInt(n: number): number {
    return Math.round(n * Math.random());
  }
}
