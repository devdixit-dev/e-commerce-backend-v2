import { Router } from "express";
import { addAddress, address, addToWishlist, changePassword, profile, removeAccount, removeFromWishlist, updateAddress, updateProfile, wishlist } from "../controllers/user.controller";
import { Validate } from "../middlewares/validation.middleware";
import { updateDataSchema } from "../validators/user.validator";

const UserRouter = Router();

UserRouter.get('/profile', profile);

UserRouter.put('/profile', Validate(updateDataSchema), updateProfile);

UserRouter.patch('/change-password', changePassword);

UserRouter.delete('/account', removeAccount);

UserRouter.get('/address', address);

UserRouter.post('/address', addAddress);

UserRouter.put('/address', updateAddress);

UserRouter.get('/wishlist', wishlist);

UserRouter.post('/wishlist/:productId', addToWishlist);

UserRouter.delete('/wishlist/:productId', removeFromWishlist);

export default UserRouter;