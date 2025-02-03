import { Logger } from "typeorm";

import logger from "./index";

export class PinoTypeormLogger implements Logger {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {}

  logQuery(query: string, parameters?: any[]) {
    const sql =
      query + (parameters?.length ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}` : "");
    logger.debug(sql);
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    const sql =
      query + (parameters?.length ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}` : "");
    logger.error(error);
    logger.error(sql);
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    const sql = `${
      query + (parameters?.length ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}` : "")
    } -- took ${time}ms`;
    logger.warn(sql);
  }

  logSchemaBuild(message: string) {
    logger.debug(message);
  }

  logMigration(message: string) {
    logger.debug(message);
  }

  log(level: "log" | "info" | "warn", message: any) {
    switch (level) {
      case "log":
      case "info":
        logger.info(message);
        break;
      case "warn":
        logger.warn(message);
        break;
      default:
        logger.info(message);
    }
  }

  protected stringifyParams(parameters: any[]) {
    try {
      return JSON.stringify(parameters);
    } catch (error) {
      // most probably circular objects in parameters
      return parameters;
    }
  }
}
