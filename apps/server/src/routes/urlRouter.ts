import express, { Router } from "express";
import prisma from "@url-shortner/db";
import redisClient from "@url-shortner/cache";

const urlRouter: Router = express.Router();

urlRouter.get("/urls/:shortUrl", async (req, res) => {
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
  if (!url) {
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

  // TODO: push to analytics queue

  res.redirect(url);
});

urlRouter.post("/urls", (req, res) => {});

export default urlRouter;
