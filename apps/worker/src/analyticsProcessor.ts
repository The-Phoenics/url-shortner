import prisma from "@url-shortner/db";
import type { AnalyticsJobDataType } from "@url-shortner/shared/types";
import type { Job } from "bullmq";

async function analyticsProcessor(job: Job<AnalyticsJobDataType>) {
  const { shortUrlId, ipAddress } = job.data;

  await prisma.$transaction(async (tx) => {
    const urlInstance = await tx.url.findUnique({
      where: {
        shortUrlId: shortUrlId,
      },
    });

    if (urlInstance) {
      // create visitor table
      await tx.visitor.create({
        data: {
          urlId: urlInstance.id,
          ipAddress: ipAddress,
        },
      });
      // update visit count
      await tx.url.update({
        where: {
          id: urlInstance.id,
        },
        data: {
          visitCount: urlInstance.visitCount + 1,
        },
      });
    }
  });
}

export default analyticsProcessor;
