import pino from "pino";
import pretty from "pino-pretty";

const isProduction = process.env.NODE_ENV === "production";

const logger = isProduction ? pino() : pino(pretty());

export default logger;
