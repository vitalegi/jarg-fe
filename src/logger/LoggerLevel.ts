export default class LoggerLevel {
  public static ERROR = 4;
  public static TRACE = 3;
  public static INFO = 2;
  public static DEBUG = 1;

  public static getLogLevel(level: string): number {
    if (level === "ERROR") {
      return LoggerLevel.ERROR;
    }
    if (level === "TRACE") {
      return LoggerLevel.TRACE;
    }
    if (level === "INFO") {
      return LoggerLevel.INFO;
    }
    if (level === "DEBUG") {
      return LoggerLevel.DEBUG;
    }
    throw Error(`Unknown logger level ${level}`);
  }
}
