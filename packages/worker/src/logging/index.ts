import PinoLogger from "./pino.js";

export interface LoggerImpl {
  log(message: string): void;
  error(message: string | Error): void;
  warn(message: string): void;
  debug(message: string): void;
}

export default class Logger {
  private static logger: LoggerImpl = new PinoLogger();

  public static reinitialize(): void {
    this.logger = new PinoLogger();
  }

  public static log(message: string): void {
    this.logger.log(message);
  }

  public static error(message: string | Error): void {
    this.logger.error(message);
  }

  public static warn(message: string): void {
    this.logger.warn(message);
  }

  public static debug(message: string): void {
    this.logger.debug(message);
  }
}
