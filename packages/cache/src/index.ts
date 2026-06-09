import { env } from "@url-shortner/env/server";
import Redis from "ioredis";

function createRedisClient() {
  let redis = new Redis(env.REDIS_URL);

  redis.on("error", (err) => {
    console.log("Error occ:", err);
    throw Error("Failed to connect to redis server");
  });

  redis.on("connect", () => console.log("Redis client connected successfully"));
  return redis;
}

const redisClient = createRedisClient();
export default redisClient;
