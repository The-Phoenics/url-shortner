import express, { Router } from "express";
import prisma from "@url-shortner/db";
import redisClient from "@url-shortner/cache";
import { auth } from "@url-shortner/auth";
import { fromNodeHeaders } from "better-auth/node";
import Sqids from "sqids";
import addAnalyticsJob from "@url-shortner/queue";
import type { AnalyticsJobDataType } from "@url-shortner/shared/types";
import { apiJsonRseponse } from "../utils";

function generateShortUrlString(length: number, id: number) {
  const squids = new Sqids({ minLength: length });
  return squids.encode([id]);
}

const urlRouter: Router = express.Router();

urlRouter.get("/:shortUrl", async (req, res) => {
  let shortUrlString: string | undefined = req.params.shortUrl;
  shortUrlString = shortUrlString.trim();
  if (!shortUrlString) {
    return res.status(404).json(apiJsonRseponse(false, null, "Invalid url"));
  }

  let url: string | null = null;

  // check cache
  url = await redisClient.get(shortUrlString);
  if (url) {
    console.log("CACHE HIT");
  }

  // check db if not found in cache
  if (!url) {
    console.log("CACHE MISS");
    const urlInstance = await prisma.url.findUnique({
      where: {
        shortUrlId: shortUrlString,
      },
    });
    url = urlInstance?.originalUrl ?? null;
  }

  if (!url) {
    return res.status(404).json(apiJsonRseponse(false, null, "Invalid url"));
  }

  // update cache
  redisClient.set(shortUrlString, url);

  // add url visit job to analytics queue
  const jobData: AnalyticsJobDataType = {
    shortUrlId: shortUrlString,
    ipAddress: req.ip ?? "",
  };
  await addAnalyticsJob(jobData);

  res.redirect(url);
});

urlRouter.post("/", async (req, res) => {
  const user = req.user;
  if (!user) {
    return res
      .status(401)
      .json(apiJsonRseponse(false, null, "Unauthorized user session"));
  }

  let originalUrl: string | undefined = req.body.originalUrl;

  if (!originalUrl) {
    return res
      .status(400)
      .json(apiJsonRseponse(false, null, "Invalid redirect url provided"));
  }
  originalUrl = originalUrl.trim();

  const createdUrl = await prisma.$transaction(async (tx) => {
    const url = await tx.url.create({
      data: {
        userId: user.id,
        originalUrl: originalUrl,
      },
    });
    const updatedUrl = tx.url.update({
      data: {
        shortUrlId: generateShortUrlString(8, url.num),
      },
      where: {
        id: url.id,
        userId: url.userId,
      },
    });
    return updatedUrl;
  });

  if (!createdUrl) {
    return res
      .status(500)
      .json(apiJsonRseponse(false, null, "Failed to create short url"));
  }

  res.status(201).json(
    apiJsonRseponse(
      true,
      {
        shortUrlId: createdUrl.shortUrlId,
        originalUrl: originalUrl,
      },
      "Successfully created short url",
    ),
  );
});

export default urlRouter;
