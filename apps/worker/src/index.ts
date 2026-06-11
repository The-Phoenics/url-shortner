import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_TYPE } from "@url-shortner/shared/types";
import { env } from "@url-shortner/env/server";

const bullMqConnection: ConnectionOptions = {
  // host: new URL(env.REDIS_URL).hostname,
  // port: Number(new URL(env.REDIS_URL).port) || 6379,
  // password: new URL(env.REDIS_URL).password || undefined,
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
};

const urlAnalyticsWorker = new Worker(
  QUEUE_TYPE.ANALYTICS_QUEUE,
  async (job) => {
    console.log("Working on a job:");
    console.log("Job data:", job.data);
  },
  {
    connection: bullMqConnection,
    concurrency: 5,
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 50 },
  },
);

urlAnalyticsWorker.on("error", (err) => {
  console.log("Worker: Analytics worker error: ", err);
});

urlAnalyticsWorker.on("ready", () => {
  console.log("Worker: Analytics worker ready");
});

urlAnalyticsWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

urlAnalyticsWorker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});

await urlAnalyticsWorker.waitUntilReady();
console.log(
  `Worker: Worker "${QUEUE_TYPE.ANALYTICS_QUEUE}" connected to redis`,
);
