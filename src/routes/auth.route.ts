import { Router } from "express";

import { authInit, signIn } from "../controllers/auth.controller";
import { Validate } from "../middlewares/validation.middleware";
import { authInitSchema, signInSchema } from "../validators/auth.validator";

const authRouter = Router();

authRouter.post('/init', Validate(authInitSchema), authInit);

authRouter.post('/login', Validate(signInSchema), signIn);

authRouter.post('/refresh-token', () => {});

authRouter.post('/logout', () => {});

authRouter.post('/forgot-password', () => {});

authRouter.post('/reset-password/:token', () => {});

authRouter.put('/verify-email/:token', () => {});

authRouter.post('/resend-verification', () => {});

export default authRouter;