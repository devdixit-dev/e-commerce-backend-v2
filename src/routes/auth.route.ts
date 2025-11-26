import { Router } from "express";

import { authInit, forgotPassword, resendVerification, resetPassword, signIn, signOut, verifyEmail } from "../controllers/auth.controller";
import { Validate } from "../middlewares/validation.middleware";
import { authInitSchema, signInSchema } from "../validators/auth.validator";
import auth from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post('/init', Validate(authInitSchema), authInit);

authRouter.post('/signin', Validate(signInSchema), signIn);

authRouter.post('/refresh-token', () => {});

authRouter.post('/signout', auth, signOut);

authRouter.post('/forgot-password', forgotPassword); // 1

authRouter.post('/reset-password', resetPassword); // 3

authRouter.put('/verify-email', verifyEmail); // 2

authRouter.post('/resend-verification', resendVerification); // 4

export default authRouter;