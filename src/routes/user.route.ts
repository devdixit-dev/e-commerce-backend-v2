import { Router } from "express";
import { profile, updateProfile } from "../controllers/user.controller";
import { Validate } from "../middlewares/validation.middleware";
import { updateDataSchema } from "../validators/user.validator";

const UserRouter = Router();

UserRouter.get('/profile', profile);

UserRouter.put('/profile', Validate(updateDataSchema), updateProfile);

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