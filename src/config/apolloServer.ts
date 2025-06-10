import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import resolvers from "@/web/resolvers/index";
import customAuthChecker from "./authChecker";

import { updateTransactionStatus } from "@/web//services/Transaction/index";

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

  app.post("/webhook", express.json(), async (req, res) => {
    try {
      console.log("📩 Webhook recibido:", JSON.stringify(req.body, null, 2));

      const { type, payload } = req.body;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { external_reference } = payload || {}; // Evita errores si payload es undefined

      // Validación robusta
      if (!external_reference || !type) {
        console.error("❌ Datos incompletos en el webhook");
        return res.status(400).json({ error: "Se requieren external_reference y type" });
      }

      console.log("🔧 Llamando a updateTransactionStatus...");
      console.log(`   - external_reference: ${external_reference}`);
      console.log(`   - type: ${type}`);

      // Ejecutar y loguear la respuesta
      const result = await updateTransactionStatus(external_reference, type);
      console.log("✅ Resultado de updateTransactionStatus:", result);

      return res.json({ message: "Webhook procesado correctamente" });
    } catch (error) {
      console.error("❌ Error crítico en el webhook:", error);
      return res.status(500).json({
        error: "Error interno",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

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
