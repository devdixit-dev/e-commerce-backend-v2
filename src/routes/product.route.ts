import express from 'express';
import { products } from '../controllers/product.controller';

const productRoute = express.Router();

productRoute.get('/products', products);

productRoute.get('/product/:productId')

productRoute.post('/product')

productRoute.put('/product/:productId')

productRoute.delete('/product/:productId')

productRoute.get('/product/search/:query')

productRoute.get('/product/filter')

productRoute.post('/product/:productId/images')

productRoute.delete('/product/:productId/images/:imageId')

productRoute.post('/product/featured')

productRoute.post('/product/trending')

export default productRoute;