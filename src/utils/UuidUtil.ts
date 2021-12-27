import Container from "typedi";
import RandomService from "@/services/RandomService";
import { v4 as uuidv4 } from "uuid";

export default class UuidUtil {
  private static counter = 0;

  public constructor() {
    const randomService = Container.get<RandomService>(RandomService);
    UuidUtil.counter = randomService.randomInt(1000000);
  }

  public static nextId(): string {
    return uuidv4();
  }
}
