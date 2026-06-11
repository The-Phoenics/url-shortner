import express, { Router } from "express";
import prisma from "@url-shortner/db";
import redisClient from "@url-shortner/cache";
import { auth } from "@url-shortner/auth";
import { fromNodeHeaders } from "better-auth/node";
import Sqids from "sqids";
import analyticsQueue from "@url-shortner/queue";
import addAnalyticsJob from "@url-shortner/queue";

function generateShortUrlString(length: number, id: number) {
  const squids = new Sqids({ minLength: length });
  return squids.encode([id]);
}

const urlRouter: Router = express.Router();

urlRouter.get("/:shortUrl", async (req, res) => {
  let shortUrlString: string | undefined = req.params.shortUrl;
  shortUrlString = shortUrlString.trim();
  if (!shortUrlString) {
    return res.json({
      status: 404,
      message: "Invalid url",
    });
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
    return res.json({
      status: 404,
      message: "Invalid url",
    });
  }

  // update cache
  redisClient.set(shortUrlString, url);

  // add url visit job to analytics queue
  await addAnalyticsJob({ shortUrlString: shortUrlString });
  
  res.redirect(url);
});

urlRouter.post("/", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const user = session?.user;
  if (!session || !user) {
    return res.json({
      status: 401,
      message: "Unauthorized user session",
    });
  }

  let originalUrl: string | undefined = req.body.originalUrl;

  if (!originalUrl) {
    return res.json({
      status: 400,
      message: "Invalid redirect url provided",
    });
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
    return res.json({
      status: 500,
      message: "Failed to create short url",
    });
  }

  res.json({
    status: 201,
    message: "Successfully created short url",
    data: {
      shortUrlId: createdUrl.shortUrlId,
      originalUrl: originalUrl,
    },
  });
});

export default urlRouter;
