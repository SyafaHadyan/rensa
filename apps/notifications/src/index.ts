import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { env } from "./config/env";
import { apiController } from "./modules";

export const app = new Elysia()
  .use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .get("/health", () => ({ status: "ok" }))
  .use(apiController)
  .listen({ hostname: "0.0.0.0", port: env.port }, () =>
    console.log(`Server is running on http://localhost:${env.port}`),
  );
