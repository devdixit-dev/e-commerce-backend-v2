import express from 'express';
import { addProduct, productAddImages, productById, productBySlug, productFeatured, productRemoveImages, products, productTrending, removeProductById, updateProductById } from '../controllers/product.controller';
import { Validate } from '../middlewares/validation.middleware';
import { addProductSchema } from '../validators/product.validator';
import { isAdmin } from '../middlewares/auth.middleware';
import upload from '../middlewares/multer.middleware';

const productRouter = express.Router();

productRouter.get('/', products);

productRouter.get('/:productId', productById);

productRouter.get('/:slug', productBySlug)

productRouter.post('/add', Validate(addProductSchema), isAdmin, addProduct);

productRouter.put('/update/:productId', isAdmin, updateProductById);

productRouter.delete('/remove/:productId', isAdmin, removeProductById);

productRouter.post('/:productId/images', isAdmin, upload.array('productImages', 5), productAddImages);

productRouter.delete('/:productId/images/:imageId', productRemoveImages);

productRouter.post('/featured', productFeatured);

productRouter.post('/trending', productTrending);

export default productRouter;