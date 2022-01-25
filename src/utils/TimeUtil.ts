import LoggerFactory from "@/logger/LoggerFactory";

export default class TimeUtil {
  static logger = LoggerFactory.getLogger("Utils.TimeUtil");

  public static timestamp(): number {
    return window.performance ? window.performance.now() : Date.now();
  }

  public static monitor<E>(name: string, fn: () => E, msInfo: number): E {
    const now = TimeUtil.timestamp();
    const out = fn();
    TimeUtil.log(name, msInfo, now);
    return out;
  }

  public static async monitorAsync<E>(
    name: string,
    fn: () => Promise<E>,
    msInfo: number
  ): Promise<E> {
    const now = TimeUtil.timestamp();
    const out = await fn();
    TimeUtil.log(name, msInfo, now);
    return out;
  }

  protected static log(name: string, msInfo: number, start: number): void {
    const duration = Math.round(100 * (TimeUtil.timestamp() - start)) / 100;
    if (duration > msInfo) {
      this.logger.info(`MONITORING name=${name} duration=${duration}ms`);
    } else {
      this.logger.debug(`MONITORING name=${name} duration=${duration}ms`);
    }
  }
}
