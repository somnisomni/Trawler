import type { LoggerImpl } from "./index.js";
import { default as pino } from "pino";

export default class PinoLogger implements LoggerImpl {
  private pino: pino.Logger;

  constructor() {
    const isPrettyLoggingEnabled = process.env.TRAWLER_LOGGING_PRETTY === "true";
    const isVerboseLoggingEnabled = process.env.TRAWLER_LOGGING_VERBOSE === "true";

    this.pino = pino({
      level: isVerboseLoggingEnabled ? "debug" : "info",
      transport: isPrettyLoggingEnabled
        ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
        : undefined,
      base: {
        pid: process.pid,
      },
    });

    this.debug("Verbose(debug) logging enabled");
  }

  public log(message: string): void {
    this.pino.info(message);
  }

  public error(message: string | Error): void {
    this.pino.error(message);
  }

  public warn(message: string): void {
    this.pino.warn(message);
  }

  public debug(message: string): void {
    this.pino.debug(message);
  }
}
