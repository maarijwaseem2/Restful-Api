import { Router } from "express";
import * as UserController from "../controllers/user";
import checkAuth from "../middleware/check-auth";

const router = Router();

router.post("/signup", UserController.user_signup);

router.post("/login", UserController.user_login);

router.delete("/:userId", checkAuth, UserController.user_delete);

export default router;
