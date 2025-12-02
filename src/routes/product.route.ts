import express from 'express';
import { addProduct, productAddImages, productById, productFeatured, productRemoveImages, products, productsByFilter, productsByQueries, productTrending, removeProductById, updateProductById } from '../controllers/product.controller';
import { Validate } from '../middlewares/validation.middleware';
import { addProductSchema } from '../validators/product.validator';
import { isAdmin } from '../middlewares/auth.middleware';

const productRouter = express.Router();

productRouter.get('/', products);

productRouter.get('/:productId', productById);

productRouter.post('/add', Validate(addProductSchema), isAdmin, addProduct);

productRouter.put('/update/:productId', updateProductById);

productRouter.delete('/remove/:productId', removeProductById);

productRouter.get('/search/:query', productsByQueries);

productRouter.get('/filter', productsByFilter);

productRouter.post('/:productId/images', productAddImages);

productRouter.delete('/:productId/images/:imageId', productRemoveImages);

productRouter.post('/featured', productFeatured);

productRouter.post('/trending', productTrending);

export default productRouter;