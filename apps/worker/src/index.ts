import { QUEUE_TYPE, type AnalyticsJobDataType } from "@url-shortner/shared/types";
import createWorker from "./createWorker";
import analyticsProcessor from "./analyticsProcessor";

await createWorker<AnalyticsJobDataType>(
  QUEUE_TYPE.ANALYTICS_QUEUE,
  analyticsProcessor,
);

// create more workers here like email, image processing, etc.
