import logger from "../Log";
import { components } from "./components";
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const openapiPath = path.join(__dirname, "openapi.yml");

// Basic Meta Informations about our API
const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Crossfit WOD API", version: "1.0.0" },
    components
  },
  apis: [openapiPath]
};

// Docs in JSON format
const swaggerSpec = swaggerJSDoc(options);

// Function to setup our docs
const swaggerDocs = (app: any, port: any) => {
  // Route-Handler to visit our docs
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Make our docs in JSON format available
  app.get("/docs.json", (req: any, res: any) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  logger.info(`Version 1 Docs are available on http://localhost:${port}/docs`);
};

module.exports = { swaggerDocs };
