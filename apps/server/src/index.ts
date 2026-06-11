import { auth } from "@url-shortner/auth";
import { env } from "@url-shortner/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import apiRouter from "./routes";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/api", apiRouter);

/*
  /api/auth/sign-up/email
  /api/auth/sign-in/email
  /api/auth/signout
*/
app.all("/api/auth{/*path}", toNodeHandler(auth));

app.listen(env.PORT, () => {
  console.log(`Server: Server started on port ${env.PORT}`);
});
