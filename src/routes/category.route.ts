import { Router } from 'express';

import { addImgeForCategory, categories, categoryById } from '../controllers/category.controller';
import upload from '../middlewares/multer.middleware';
import { isAdmin } from '../middlewares/auth.middleware';

const categoryRouter = Router();

categoryRouter.get('/', categories);

categoryRouter.get('/:id', categoryById);

categoryRouter.post('/add/image/:id', isAdmin, upload.single('image'), addImgeForCategory);

export default categoryRouter;