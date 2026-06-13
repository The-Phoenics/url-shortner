declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

import { type Visitor } from "@url-shortner/db/client";

export enum QUEUE_TYPE {
  ANALYTICS_QUEUE = "analytics-queue",
  // EMAIL_QUEUE
}

export type AnalyticsJobDataType = Pick<Visitor, "ipAddress"> & {
  shortUrlId: string;
};
