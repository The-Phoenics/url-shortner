import rateLimit, { ipKeyGenerator, type Options } from "express-rate-limit";
import RedisStore, { type RedisReply } from "rate-limit-redis";
import redisClient from "@url-shortner/cache";
import { apiJsonRseponse } from "@/utils";
import type { NextFunction, Request, Response } from "express";

interface AuthenticatedRequestType extends Request {
  user: {
    id: string;
  };
}

const failedRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  options: Options,
) => {
  return res
    .status(options.statusCode)
    .json(
      apiJsonRseponse(
        false,
        {},
        options.message !== "string"
          ? options.message
          : "Too many requests, please try again later.",
      ),
    );
};

export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 60,
  standardHeaders: true,// return `RateLimit-*` headers
  legacyHeaders: false, // disable `X-RateLimit-*` headers
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redisClient.call(command, ...args) as Promise<RedisReply>,
    prefix: "rl:global:",
  }),
  keyGenerator: (req) => {
    const key = req.ip ?? req.socket.remoteAddress ?? "fallback";
    if (!key) {
      console.warn("Server: Global ratelimiter could not resolve client IP");
    }
    return ipKeyGenerator(key);
  },
  // handler for failed requests
  handler: failedRequestHandler,
});

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redisClient.call(command, ...args) as Promise<RedisReply>,
    prefix: "rl:auth:",
  }),
  skipSuccessfulRequests: true, // don't count the successful requests
  keyGenerator: (req) => {
    const request = req as AuthenticatedRequestType;
    const user = request.user;
    if (!user) {
      console.warn("Server: Auth ratelimiter could not resolve user");
    }
    const key = user?.id ?? "";
    return key;
  },
  // handler for failed requests
  handler: failedRequestHandler,
});
