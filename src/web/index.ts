import cookieParser from "cookie-parser";

import express from "express";

// Apollo Server
import { initializeApolloServer } from "@/config/apolloServer";

// Config environment
import config from "@/config";

const ws = express();

// Parse incoming requests data
ws.use(express.json({ limit: "10mb" }));
ws.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }));

void initializeApolloServer(ws);

// Permitir todas las peticiones para todas las rutas
ws.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

ws.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

ws.use(express.json());

ws.use(cookieParser(config.web.cookieSecret));

ws.get("/", async (req, res) => {
  try {
    res.type("json").send(
      JSON.stringify(
        {
          status: "ON",
          time: new Date().toUTCString(),
          date: new Date().toISOString()
        },
        null,
        2
      )
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

export default ws;
