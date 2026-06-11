import express, { Router } from "express";
import prisma from "@url-shortner/db";
import { auth } from "@url-shortner/auth";
import { fromNodeHeaders } from "better-auth/node";
import { apiJsonRseponse } from "../utils";

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
} as const;

const userRouter: Router = express.Router();

userRouter.get("/", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const user = session?.user;
  if (!session || !user) {
    return res
      .status(401)
      .json(apiJsonRseponse(false, null, "Unauthorized user session"));
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: userSelect,
  });

  if (!dbUser) {
    return res.status(404).json(apiJsonRseponse(false, null, "User not found"));
  }

  return res
    .status(200)
    .json(apiJsonRseponse(true, dbUser, "User fetched successfully"));
});

userRouter.patch("/", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const user = session?.user;
  if (!session || !user) {
    return res
      .status(401)
      .json(apiJsonRseponse(false, null, "Unauthorized user session"));
  }

  const { name, image } = req.body as { name?: string; image?: string | null };
  const updateData: { name?: string; image?: string | null } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json(apiJsonRseponse(false, null, "Invalid name"));
    }
    updateData.name = name.trim();
  }

  if (image !== undefined) {
    if (image !== null && typeof image !== "string") {
      return res
        .status(400)
        .json(apiJsonRseponse(false, null, "Invalid image"));
    }
    updateData.image = image;
  }

  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .json(apiJsonRseponse(false, null, "No valid fields to update"));
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: userSelect,
  });

  return res
    .status(200)
    .json(apiJsonRseponse(true, updatedUser, "User updated successfully"));
});

export default userRouter;