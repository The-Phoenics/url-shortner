import { auth } from "@url-shortner/auth";
import { env } from "@url-shortner/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Application } from "express";
import apiRouter from "./routes";
import { apiJsonRseponse } from "./utils";
import { authRateLimiter, globalRateLimiter } from "./rateLimiter";
import { authMiddleware } from "./middleware";

const app: Application = express();

app.set("trust proxy", 1); // no. of proxies (load balancer) whose ip won't be considered client IP

// app middlewares
app.use(express.json());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(globalRateLimiter);

app.get("/api/health", async (req, res) => {
  res.status(201).json(
    apiJsonRseponse(true, {
      health: "Ok",
    }),
  );
});

app.use("/api", authMiddleware, authRateLimiter, apiRouter);

/*
  /api/auth/sign-up/email
  /api/auth/sign-in/email
  /api/auth/signout
*/
app.all("/api/auth{/*path}", toNodeHandler(auth));

app.listen(env.PORT, () => {
  console.log(`Server: Server started on port ${env.PORT}`);
});
