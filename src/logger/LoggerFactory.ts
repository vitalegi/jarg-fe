import Logger from "@/logger/Logger";
import LoggerCore from "@/logger/LoggerCore";

export default class LoggerFactory {
  private static core = new LoggerCore();

  public static getLogger(name: string): Logger {
    return new Logger(name, this.core);
  }
}
