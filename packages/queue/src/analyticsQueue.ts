import { QUEUE_TYPE } from "@url-shortner/shared/types";
import createQueue from "./createQueue";

interface AnalyticsJobData {
  shortUrlString: string;
}

const analyticsQueue = await createQueue<AnalyticsJobData>(
  QUEUE_TYPE.ANALYTICS_QUEUE,
);

async function addAnalyticsJob(jobData: AnalyticsJobData) {
  let job;
  try {
    job = await analyticsQueue.add("analytics", jobData);
    console.log("Queue:info JOB ADDED")
  } catch (err) {
    console.log("Queue add job error:", err);
  }
  return job;
}

export default addAnalyticsJob;
