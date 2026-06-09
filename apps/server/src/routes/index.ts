import express, { Router } from "express";
import urlRouter from "./urlRouter";

const apiRouter: Router = express.Router();

// apiRouter.use("/auth", authRouter) // TODO:
apiRouter.use("/urls", urlRouter);

export default apiRouter;
