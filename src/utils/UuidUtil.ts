import Container from "typedi";
import RandomService from "@/services/RandomService";
import TimeUtil from "./TimeUtil";

export default class UuidUtil {
  private static counter = 0;

  public constructor() {
    const randomService = Container.get<RandomService>(RandomService);
    UuidUtil.counter = randomService.randomInt(1000000);
  }

  public static nextId(): string {
    return `${this.counter++}_${Math.round(TimeUtil.timestamp())}`;
  }
}
