import { Router } from "express";

import { authInit, forgotPassword, resendVerification, resetPassword, signIn, signOut, verifyEmail } from "../controllers/auth.controller";
import { Validate } from "../middlewares/validation.middleware";
import { authInitSchema, signInSchema } from "../validators/auth.validator";
import {auth} from "../middlewares/auth.middleware";
import customRateLimiter from "../middlewares/rateLimiter.middleware";

const authRouter = Router();

authRouter.post('/init', Validate(authInitSchema), customRateLimiter(10 * 60 * 1000, 15), authInit);

authRouter.post('/signin', Validate(signInSchema), customRateLimiter(15 * 60 * 1000, 20), signIn);

authRouter.post('/refresh-token', () => {});

authRouter.post('/signout', auth, signOut);

authRouter.post('/forgot-password', forgotPassword);

authRouter.post('/verify-email', customRateLimiter(10 * 60 * 1000, 10), verifyEmail);

authRouter.post('/reset-password', resetPassword);

authRouter.post('/resend-verification', customRateLimiter(10 * 60 * 1000, 5), resendVerification);

export default authRouter;