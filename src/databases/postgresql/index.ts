/* eslint-disable import/no-mutable-exports */

import { DataSource } from "typeorm";

import logger from "@/services/Log";
import DataSourceIns from "@/databases/postgresql/config";

let connection: DataSource = DataSourceIns;

const Database = async (): Promise<DataSource> => {
  if (connection) return connection;

  connection = DataSourceIns;

  try {
    await connection.initialize();
    logger.info("PostgreSQL Database connected");
  } catch (e) {
    logger.error("PostgreSQL Database error", { error: e });
    throw new Error("PostgreSQL Database error");
  }

  return connection;
};

export default Database;
export { connection };
