import Router from "express"
import { UserController } from "../resources/user/user.controller";
import userAuthenticated from "../middlewares/userAuthenticated";

const userController = new UserController();

const userRouter = Router();

userRouter.post("/signin", userController.signin);
userRouter.post("/signup", userController.signup);
userRouter.get("/me",userAuthenticated , userController.me);


export default userRouter;
