export default class TimeUtil {
  public static timestamp(): number {
    return window.performance ? window.performance.now() : Date.now();
  }
}
