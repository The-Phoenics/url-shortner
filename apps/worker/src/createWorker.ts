import {
  Worker,
  type ConnectionOptions,
  type Processor,
  type WorkerOptions,
} from "bullmq";
import { QUEUE_TYPE } from "@url-shortner/shared/types";
import { env } from "@url-shortner/env/server";

const bullMqConnection: ConnectionOptions = {
  // host: new URL(env.REDIS_URL).hostname,
  // port: Number(new URL(env.REDIS_URL).port) || 6379,
  // password: new URL(env.REDIS_URL).password || undefined,
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
};

const defaultWorkerOptions: WorkerOptions = {
  connection: bullMqConnection,
  concurrency: 5,
  removeOnComplete: { count: 10 },
  removeOnFail: { count: 50 },
};

async function createWorker<T>(
  workerQueueType: QUEUE_TYPE,
  processor: Processor<T>,
  workerOptions: WorkerOptions = defaultWorkerOptions,
) {
  const worker = new Worker(workerQueueType, processor, {
    ...defaultWorkerOptions,
    ...workerOptions,
  });

  worker.on("error", (err) => {
    console.log(
      `Worker: "${QUEUE_TYPE.ANALYTICS_QUEUE}" worker failed with an error: `,
      err,
    );
  });

  worker.on("completed", (job) => {
    console.log(
      `Worker: ${QUEUE_TYPE.ANALYTICS_QUEUE} worker finished job with id ${job?.id}`,
    );
  });

  worker.on("failed", (job, err) => {
    console.log(
      `Worker: ${QUEUE_TYPE.ANALYTICS_QUEUE} worker failed job with id${job?.id}, error: ${err.message}`,
    );
  });

  await worker.waitUntilReady();
  console.log(
    `Worker: "${QUEUE_TYPE.ANALYTICS_QUEUE}" worker connected to redis`,
  );

  return worker;
}

export default createWorker;
