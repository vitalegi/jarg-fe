import Appender from "@/logger/appender/Appender";
import ConsoleAppender from "@/logger/appender/ConsoleAppender";
import LoggerEnabler from "@/logger/LoggerEnabler";
import LoggerLevel from "@/logger/LoggerLevel";
import RULES from "@/assets/logger.json";

export default class LoggerCore {
  protected appenders: Appender[] = this.getAppenders();
  protected enabler = new LoggerEnabler();

  public log(
    logLevel: number,
    name: string,
    message: string,
    params: any[]
  ): void {
    if (this.enabler.isEnabled(logLevel, name)) {
      const log = this.format(logLevel, name, message, params);
      const appenders = this.appenders.filter((a) =>
        this.enabler.isAppenderEnabled(a.getLevel(), logLevel)
      );
      if (logLevel === LoggerLevel.ERROR) {
        let e: any = null;
        if (params.length > 0) {
          e = params[params.length - 1];
        }
        appenders.forEach((a) => a.error(log, e));
      } else {
        appenders.forEach((a) => a.append(log));
      }
    }
  }

  public isEnabled(logLevel: number, name: string): boolean {
    return this.enabler.isEnabled(logLevel, name);
  }

  protected format(
    logLevel: number,
    name: string,
    message: string,
    ...params: any[]
  ): string {
    return `${this.formatDate(new Date())} [${this.formatLogLevel(
      logLevel
    )}] ${name} ${message} ${params}`;
  }

  protected formatDate(date: Date): string {
    const year = this.pad(date.getFullYear(), 4);
    const month = this.pad(date.getMonth() + 1, 2);
    const day = this.pad(date.getDate(), 2);
    const hour = this.pad(date.getHours(), 2);
    const minute = this.pad(date.getMinutes(), 2);
    const second = this.pad(date.getSeconds(), 2);
    const millisecond = this.pad(date.getMilliseconds(), 3);
    const timezone = this.timezone(date);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}T${timezone}`;
  }

  protected formatLogLevel(logLevel: number): string {
    switch (logLevel) {
      case LoggerLevel.DEBUG:
        return "DEBUG";
      case LoggerLevel.INFO:
        return " INFO";
      case LoggerLevel.ERROR:
        return "ERROR";
      case LoggerLevel.TRACE:
        return "TRACE";
    }
    return "?????";
  }

  protected pad(value: number, length: number): string {
    let tmp = `${value}`;
    while (tmp.length < length) {
      tmp = "0" + tmp;
    }
    return tmp;
  }

  protected timezone(date: Date): string {
    let offset = date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    offset = Math.abs(offset);
    const hours = Math.floor(offset / 60);
    const minutes = offset % 60;
    return `${sign}${this.pad(hours, 2)}:${this.pad(minutes, 2)}`;
  }

  protected getAppenders(): Appender[] {
    return RULES.appenders.map((a) => {
      if (a.name === "console") {
        return new ConsoleAppender(LoggerLevel.getLogLevel(a.level));
      }
      throw Error(`Appender ${a.name} not recognized.`);
    });
  }
}
