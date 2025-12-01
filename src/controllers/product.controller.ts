import { Request, Response } from "express";
import { makeLogFile } from "../utils/logger";
import RedisClient from "../config/redis.config";
import Product from "../models/product.model";

export const products = async (req: Request, res: Response) => {
  try{
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit

    const filter: any = { isActive: true };
    if(req.query.category) filter.category = req.query.category;
    if(req.query.brand) filter.brand = req.query.brand;

    const cacheKey = `home:products:${JSON.stringify(filter)}:${page}:${limit}`;
    const cache = await RedisClient.get(cacheKey);

    if(cache) {
      return res.status(200).json({
        success: true,
        message: 'Products fetched',
        data: JSON.parse(cache)
      })
    }

    const products = await Product.find(filter)
    .select('productName productSlug productBrand productPrice productTags productCategory productDesc productRatings productImages productOwnedBy productStock')
    .skip(skip)
    .limit(limit)
    .lean();

    if(!products) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await RedisClient.set(
      cacheKey, JSON.stringify(products), "EX", 300
    );

    return res.status(200).json({
      success: true,
      data: products,
      page,
      limit
    });
  }
  catch(error) {
    makeLogFile("error.log", `[${Date.now()}] - ${req.ip} | ${error}`);
    console.error(`Get products error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const productById = () => {}

export const addProduct = () => {}

export const updateProductById = () => {}

export const removeProductById = () => {}

export const productsByQueries = () => {}

export const productsByFilter = () => {}

export const productAddImages = () => {}

export const productRemoveImages = () => {}

export const productFeatured = () => {}

export const productTrending = () => {}