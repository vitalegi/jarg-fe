import Appender from "@/logger/appender/Appender";

export default class ConsoleAppender implements Appender {
  append(log: string): void {
    console.log(log);
  }
  error(log: string, e: any): void {
    console.error(log, e);
  }
}
