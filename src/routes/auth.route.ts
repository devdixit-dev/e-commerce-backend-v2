import { Router } from "express";

const authRouter = Router();

authRouter.post('/register', () => {});

authRouter.post('/login', () => {});

authRouter.post('/refresh-token', () => {});

authRouter.post('/logout', () => {});

authRouter.post('/forgot-password', () => {});

authRouter.post('/reset-password/:token', () => {});

authRouter.post('/verify-email/:token', () => {});

authRouter.post('/resend-verification', () => {});

export default authRouter;