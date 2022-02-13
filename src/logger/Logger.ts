import LoggerCore from "@/logger/LoggerCore";
import LoggerLevel from "@/logger/LoggerLevel";

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

  public isInfoEnabled(): boolean {
    return this.loggerCore.isEnabled(LoggerLevel.INFO, this.name);
  }

  public debug(message: string, ...params: any[]): void {
    this.loggerCore.log(LoggerLevel.DEBUG, this.name, message, params);
  }

  public isDebugEnabled(): boolean {
    return this.loggerCore.isEnabled(LoggerLevel.DEBUG, this.name);
  }

  public trace(message: string, ...params: any[]): void {
    this.loggerCore.log(LoggerLevel.TRACE, this.name, message, params);
  }

  public isTraceEnabled(): boolean {
    return this.loggerCore.isEnabled(LoggerLevel.TRACE, this.name);
  }

  public error(message: string, ...params: any[]): void {
    this.loggerCore.log(LoggerLevel.ERROR, this.name, message, params);
  }

  public isErrorEnabled(): boolean {
    return this.loggerCore.isEnabled(LoggerLevel.ERROR, this.name);
  }
}
