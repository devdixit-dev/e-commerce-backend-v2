import { Request, Response } from "express";
import { makeLogFile } from "../utils/logger";
import RedisClient from "../config/redis.config";
import Product from "../models/product.model";
import User from "../models/user.model";

export const products = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit

    const filter: any = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;

    const cacheKey = `home:products:${JSON.stringify(filter)}:${page}:${limit}`;
    const cache = await RedisClient.get(cacheKey);

    if (cache) {
      return res.status(200).json({
        success: true,
        cache: true,
        data: JSON.parse(cache),
        page,
        limit
      });
    }

    const products = await Product.find(filter)
      .select('productName productSlug productBrand productPrice productTags productCategory productDesc productRatings productImages productOwnedBy productStock')
      .skip(skip)
      .limit(limit)
      .lean();

    if (!products) {
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
      cache: false,
      data: products,
      page,
      limit
    });
  }
  catch (error) {
    makeLogFile("error.log", `[${Date.now()}] - ${req.ip} | ${error}`);
    console.error(`Get products error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const productById = async (req: Request, res: Response) => {
  try {
    const id = req.params.productId;
    if (!id) {
      return res.status(404).json({
        success: true,
        message: 'Product ID is required'
      });
    }

    const cache = await RedisClient.get(`product:${id}`);
    if (cache) {
      return res.status(200).json({
        success: true,
        cache: true,
        data: JSON.parse(cache)
      });
    }

    const product = await Product.findById(id).select(
      'productName productSlug productBrand productPrice productTags productCategory productDesc productRatings productImages productOwnedBy productStock'
    ).lean();

    if (!product) {
      return res.status(404).json({
        success: true,
        message: 'Product not found'
      });
    }

    await RedisClient.set(`product:${product._id}`, JSON.stringify(product), "EX", 180);

    return res.status(200).json({
      success: true,
      cache: false,
      data: product
    });
  }
  catch (error) {
    makeLogFile("error.log", `[${Date.now()}] - ${req.ip} | ${error}`);
    console.error(`Get product by ID error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const addProduct = async (req: Request, res: Response) => {
  try {
    const {
      productName,
      productSlug,
      productBrand,
      productPrice,
      productTags,
      productCategory,
      productDesc,
      productStock
    } = req.body;

    const filter: any = {}
    if (productName) filter.productName = productName;
    if (productSlug) filter.productSlug = productSlug;
    if (productBrand) filter.productBrand = productBrand;
    if (productPrice) filter.productPrice = productPrice;
    if (productTags) filter.productTags = productTags;
    if (productCategory) filter.productCategory = productCategory;
    if (productDesc) filter.productDesc = productDesc;
    if (productStock) filter.productStock = productStock;

    const product = await Product.findOne(
      { productName }, { productOwnedBy: (req as any).user.id }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await Product.create({
      productName, productBrand, productPrice, productTags,
      productCategory, productDesc, productStock,
      productOwnedBy: (req as any).user.id
    });

    return res.status(201).json({
      success: true,
      data: product
    });
  }
  catch (error) {
    makeLogFile("error.log", `[${Date.now()}] - ${req.ip} | ${error}`);
    console.error(`Add products error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const updateProductById = () => { }

export const removeProductById = () => { }

export const productsByQueries = () => { }

export const productsByFilter = () => { }

export const productAddImages = () => { }

export const productRemoveImages = () => { }

export const productFeatured = () => { }

export const productTrending = () => { }