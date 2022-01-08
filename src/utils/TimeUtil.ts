export default class TimeUtil {
  public static timestamp(): number {
    return window.performance ? window.performance.now() : Date.now();
  }

  public static monitor<E>(name: string, fn: () => E): E {
    const now = TimeUtil.timestamp();
    const out = fn();
    const duration = Math.round(100 * (TimeUtil.timestamp() - now)) / 100;
    console.log(`MONITORING ${name} duration=${duration}ms`);
    return out;
  }

  public static async monitorAsync<E>(
    name: string,
    fn: () => Promise<E>
  ): Promise<E> {
    const now = TimeUtil.timestamp();
    const out = await fn();
    const duration = Math.round(100 * (TimeUtil.timestamp() - now)) / 100;
    console.log(`MONITORING ${name} duration=${duration}ms`);
    return out;
  }
}
