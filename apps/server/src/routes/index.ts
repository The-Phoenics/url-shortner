import express, { Router } from "express"
import userRouter from "./userRouter";

const apiRouter: Router = express.Router();

// apiRouter.use("/auth", authRouter) // TODO:
apiRouter.use("/user", userRouter)

export default apiRouter;