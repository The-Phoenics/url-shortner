import express, { Router } from "express";
import urlRouter from "./urlRouter";
import userRouter from "./userRouter";

const apiRouter: Router = express.Router();

apiRouter.use("/urls", urlRouter);
apiRouter.use("/users", userRouter);

export default apiRouter;
