import { Router } from 'express';

import { addCategory, categories, categoryById } from '../controllers/category.controller';
import upload from '../middlewares/multer.middleware';
import { isAdmin } from '../middlewares/auth.middleware';

const categoryRouter = Router();

categoryRouter.get('/', categories);

categoryRouter.get('/:id', categoryById);

categoryRouter.post('/', isAdmin, upload.single('image'), addCategory);

export default categoryRouter;