import Appender from "@/logger/appender/Appender";

export default class ConsoleAppender implements Appender {
  level;

  public constructor(level: number) {
    this.level = level;
  }

  getLevel(): number {
    return this.level;
  }

  append(log: string): void {
    console.log("%s", log);
  }
  error(log: string, e: any): void {
    console.error("%s", log, e);
  }
}
