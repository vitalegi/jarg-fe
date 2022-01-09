import LoggerFactory from "@/logger/LoggerFactory";

export default class TimeUtil {
  static logger = LoggerFactory.getLogger("Utils.TimeUtil");

  public static timestamp(): number {
    return window.performance ? window.performance.now() : Date.now();
  }

  public static monitor<E>(name: string, fn: () => E): E {
    const now = TimeUtil.timestamp();
    const out = fn();
    const duration = Math.round(100 * (TimeUtil.timestamp() - now)) / 100;
    this.logger.info(`MONITORING name=${name} duration=${duration}ms`);
    return out;
  }

  public static async monitorAsync<E>(
    name: string,
    fn: () => Promise<E>
  ): Promise<E> {
    const now = TimeUtil.timestamp();
    const out = await fn();
    const duration = Math.round(100 * (TimeUtil.timestamp() - now)) / 100;
    this.logger.info(`MONITORING name=${name} duration=${duration}ms`);
    return out;
  }
}
