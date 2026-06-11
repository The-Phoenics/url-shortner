import {
  QUEUE_TYPE,
  type AnalyticsJobDataType,
} from "@url-shortner/shared/types";
import createQueue from "./createQueue";

const analyticsQueue = await createQueue<AnalyticsJobDataType>(
  QUEUE_TYPE.ANALYTICS_QUEUE,
);

async function addAnalyticsJob(jobData: AnalyticsJobDataType) {
  let job;
  try {
    job = await analyticsQueue.add("analytics", jobData);
    console.log("Queue:info JOB ADDED");
  } catch (err) {
    console.log("Queue add job error:", err);
  }
  return job;
}

export default addAnalyticsJob;
