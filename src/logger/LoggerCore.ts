import ConsoleAppender from "./appender/ConsoleAppender";
import LoggerEnabler from "./LoggerEnabler";
import LoggerLevel from "./LoggerLevel";

export default class LoggerCore {
  protected appender = new ConsoleAppender();
  protected enabler = new LoggerEnabler();

  public log(
    logLevel: number,
    name: string,
    message: string,
    ...params: any[]
  ): void {
    if (this.enabler.isEnabled(logLevel, name)) {
      const log = this.format(logLevel, name, message, params);
      this.appender.append(log);
    }
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
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
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
}
