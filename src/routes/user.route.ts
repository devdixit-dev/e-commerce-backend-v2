import { Router } from "express";
import { addAddress, address, addToWishlist, changePassword, profile, removeAccount, removeFromWishlist, updateAddress, updateProfile, wishlist } from "../controllers/user.controller";
import { Validate } from "../middlewares/validation.middleware";
import { updateDataSchema } from "../validators/user.validator";
import upload from "../middlewares/multer.middleware";

const userRouter = Router();

userRouter.get('/profile', profile);

userRouter.put('/profile', Validate(updateDataSchema), upload.single('avatar'), updateProfile);

userRouter.patch('/change-password', changePassword);

userRouter.delete('/account', removeAccount);

userRouter.get('/address', address);

userRouter.post('/address', addAddress);

userRouter.put('/address', updateAddress);

userRouter.get('/wishlist', wishlist);

userRouter.post('/wishlist/:productId', addToWishlist);

userRouter.delete('/wishlist/:productId', removeFromWishlist);

export default userRouter;