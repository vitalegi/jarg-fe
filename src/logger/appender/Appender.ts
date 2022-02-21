export default interface Appender {
  getLevel(): number;
  append(log: string): void;
  error(log: string, e: any): void;
}
