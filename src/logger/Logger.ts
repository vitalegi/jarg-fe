import LoggerCore from "./LoggerCore";
import LoggerLevel from "./LoggerLevel";

export default class Logger {
  private name;
  private loggerCore;

  public constructor(name: string, loggerCore: LoggerCore) {
    this.name = name;
    this.loggerCore = loggerCore;
  }

  public info(message: string, ...params: any[]): void {
    this.loggerCore.log(LoggerLevel.INFO, this.name, message, params);
  }

  public debug(message: string, ...params: any[]): void {
    this.loggerCore.log(LoggerLevel.DEBUG, this.name, message, params);
  }

  public trace(message: string, ...params: any[]): void {
    this.loggerCore.log(LoggerLevel.TRACE, this.name, message, params);
  }

  public error(message: string, ...params: any[]): void {
    this.loggerCore.log(LoggerLevel.ERROR, this.name, message, params);
  }
}
