import RandomUtil from "./RandomUtil";
import TimeUtil from "./TimeUtil";

export default class UuidUtil {
  private static counter = RandomUtil.randomInt(10000000);
  public static nextId(): string {
    return `${this.counter++}_${TimeUtil.timestamp()}`;
  }
}
