import { auth } from "@url-shortner/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { apiJsonRseponse } from "./utils";

// attach user data to req object
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const reqUser = session?.user;
  if (!session || !reqUser) {
    return res
      .status(401)
      .json(apiJsonRseponse(false, null, "Unauthorized user session"));
  }
  const user = {
    id: reqUser.id,
  };
  req.user = user;
  next();
}
