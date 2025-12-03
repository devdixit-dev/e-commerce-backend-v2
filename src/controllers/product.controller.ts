import { Request, Response } from "express";
import { makeLogFile } from "../utils/logger";
import RedisClient from "../config/redis.config";
import Product from "../models/product.model";

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
    makeLogFile("error.log", `\n[${Date.now()}] - ${req.ip} | ${error}\n`);
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

    if (!product || !product.isActive) {
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
    makeLogFile("error.log", `\n[${Date.now()}] - ${req.ip} | ${error}\n`);
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
      productBrand,
      productPrice,
      productTags,
      productCategory,
      productDesc,
      productStock
    } = req.body;

    const filter: any = {}
    if (productName) filter.productName = productName;
    if (productBrand) filter.productBrand = productBrand;
    if (productPrice) filter.productPrice = productPrice;
    if (productTags) filter.productTags = productTags;
    if (productCategory) filter.productCategory = productCategory;
    if (productDesc) filter.productDesc = productDesc;
    if (productStock) filter.productStock = productStock;

    const product = await Product.findOne(
      { productName, productOwnedBy: (req as any).user.id }
    ).lean()

    if (product) {
      return res.status(404).json({
        success: false,
        message: "Product is already exist"
      });
    }

    const newProduct = await Product.create({
      productName, productBrand, productPrice, productTags,
      productCategory, productDesc, productStock,
      productOwnedBy: (req as any).user.id
    });

    return res.status(201).json({
      success: true,
      data: newProduct
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${Date.now()}] - ${req.ip} | ${error}\n`);
    console.error(`Add products error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const updateProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.productId;
    if (!id) {
      return res.status(200).json({
        success: false,
        message: 'Product ID is required'
      });
    }

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

    const filter: any = { isActive: true };
    if (productName) filter.productName = productName;
    if (productSlug) filter.productSlug = productSlug;
    if (productBrand) filter.productBrand = productBrand;
    if (productPrice) filter.productPrice = productPrice;
    if (productTags) filter.productTags = productTags;
    if (productCategory) filter.productCategory = productCategory;
    if (productDesc) filter.productDesc = productDesc;
    if (productStock) filter.productStock = productStock;

    const product = await Product.findByIdAndUpdate(
      id,
      filter,
      { new: true }
    ).select(filter)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${Date.now()}] - ${req.ip} | ${error}\n`);
    console.error(`update products error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const removeProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.productId;

    const product = await Product.findOneAndUpdate(
      { _id: id, productOwnedBy: (req as any).user.id, isActive: true },
      {
        $set: {
          isActive: false
        }
      }
    ).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed"
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${Date.now()}] - ${req.ip} | ${error}\n`);
    console.error(`remove products error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const productsByQueries = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.params.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {
      isActive: true,
      $or: [
        { productName: { $regex: searchQuery, $options: "i" } },
        { productBrand: { $regex: searchQuery, $options: "i" } },
        { productCategory: { $regex: searchQuery, $options: "i" } },
        { productTags: { $regex: searchQuery, $options: "i" } }
      ]
    };

    const product = await Product.find(filter)
      .limit(limit)
      .skip(skip)
      .lean()

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or invalid query"
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${Date.now()}] - ${req.ip} | ${error}\n`);
    console.error(`products by queries error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const productsByFilter = async (req: Request, res: Response) => {
  try {
    const {
      productBrand,
      productPrice,
      productCategory,
      productStock
    } = req.body;

    const filter: any = { isActive: true };

    if (productBrand) filter.productBrand = productBrand;
    if (productCategory) filter.productCategory = productCategory;

    if (productPrice) filter.productPrice = Number(productPrice);
    if (productStock) filter.productStock = Number(productStock);

    const products = await Product.find(filter).lean();
    if (!products) {
      return res.status(404).json({
        success: false,
        message: "Product not found with this filter"
      });
    }

    return res.status(200).json({
      successs: true,
      data: products
    });
  }
  catch (error) {
    makeLogFile("error.log", `[${Date.now()}] - ${req.ip} | ${error}`);
    console.error(`products by filter error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const productAddImages = async (req: Request, res: Response) => {
  try {
    const array = req.files;

    console.log(array)
  }
  catch (error) {
    makeLogFile("error.log", `[${Date.now()}] - ${req.ip} | ${error}`);
    console.error(`add images for product error: ${error}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const productRemoveImages = () => { }

export const productFeatured = () => { }

export const productTrending = () => { }