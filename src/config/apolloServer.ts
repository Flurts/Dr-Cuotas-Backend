import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import resolvers from "@/web/resolvers/index";
import customAuthChecker from "./authChecker";

import express from "express";
import cors from "cors";

export async function initializeApolloServer(app: express.Application) {
  const server = new ApolloServer({
    schema: await buildSchema({
      emitSchemaFile: `./schema.gql`,
      resolvers: [...resolvers],
      authChecker: customAuthChecker
    })
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: [
        "https://www.drcuotas.com",
        "https://studio.apollographql.com",
        "http://localhost:3000"
      ],
      credentials: true
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res
      })
    })
  );
}
