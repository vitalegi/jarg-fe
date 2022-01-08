import Logger from "./Logger";
import LoggerCore from "./LoggerCore";

export default class LoggerFactory {
  private static core = new LoggerCore();

  public static getLogger(name: string): Logger {
    return new Logger(name, this.core);
  }
}
