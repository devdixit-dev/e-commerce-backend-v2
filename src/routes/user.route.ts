import { Router } from "express";

const UserRouter = Router();

UserRouter.get('/profile', () => {});

UserRouter.put('/profile', () => {});

UserRouter.patch('/change-password', () => {});

UserRouter.delete('/account', () => {});

UserRouter.get('/addresses', () => {});

UserRouter.post('/addresses', () => {});

UserRouter.put('/addresses/:id', () => {});

UserRouter.delete('/addresses/:id', () => {});

UserRouter.get('/wishlist', () => {});

UserRouter.post('/wishlist/:productId', () => {});

UserRouter.delete('/wishlist/:productId', () => {});

export default UserRouter;