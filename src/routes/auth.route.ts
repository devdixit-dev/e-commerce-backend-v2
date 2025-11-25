import { Router } from "express";

import { authInit, forgotPassword, signIn, signOut } from "../controllers/auth.controller";
import { Validate } from "../middlewares/validation.middleware";
import { authInitSchema, signInSchema } from "../validators/auth.validator";
import auth from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post('/init', Validate(authInitSchema), authInit);

authRouter.post('/signin', Validate(signInSchema), signIn);

authRouter.post('/refresh-token', () => {});

authRouter.post('/signout', auth, signOut);

authRouter.post('/forgot-password', forgotPassword); // 1

authRouter.post('/reset-password/:token', () => {}); // 3

authRouter.put('/verify-email/:token', () => {}); // 2

authRouter.post('/resend-verification', () => {}); // 4

export default authRouter;