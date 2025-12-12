import { Request, Response } from "express";
import fs from 'fs';

import { makeLogFile } from "../utils/logger";
import Category from "../models/category.model";
import cloudinary from "../config/cloudinary.config";

export const categories = async (req: Request, res: Response) => {
  try{
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const categories = await Category.find({ isActive: true })
    .select('name image products created_by')
    .lean()
    .skip(skip);

    if(!categories) {
      return res.status(404).json({
        success: false,
        message: "Categories not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: categories
    });
  }
  catch(error) {
    console.error(`get categories error - ${error}`);
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in categories -> ${req.ip} - Error ${error}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const categoryById = async (req: Request, res: Response) => {
  try{
    const id = req.params.id;
    if(!id) {
      return res.status(404).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    const category = await Category.findById(id)
    .select('name image products created_by')
    .lean();

    if(!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found with ID'
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  }
  catch(error) {
    console.error(`get categories by id error - ${error}`);
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in categories by id -> ${req.ip} - Error ${error}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const addCategory = async(req: Request, res: Response) => {
  try{
    const {
      name, products
    } = req.body;

    const find = await Category.findOne({ name }).lean();
    if(find) {
      return res.status(201).json({
        success: false,
        message: "Category already exist"
      });
    }
  }
  catch(error) {

  }
}

export const addImgeForCategory = async (req: Request, res: Response) => {
  try{
    const id = req.params.id;
    const image = req.file;

    const find = await Category.findById(id)
    .select('name')
    .lean();

    if(!find) {
      return res.status(404).json({
        success: false,
        message: "Category not exist !"
      });
    }

    const result = await cloudinary.uploader.upload(
      String(image?.path), {
        folder: "Category"
      }
    );

    fs.unlinkSync(String(image?.path));

    await Category.findByIdAndUpdate(
      id,
      { image: result.secure_url }
    );

    return res.status(201).json({
      success: true,
      message: "Category image added"
    });
  }
  catch(error) {
    console.error(`add image categories error - ${error}`);
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in add images for categories -> ${req.ip} - Error ${error}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try{
    const id = req.params.id;
    if(!id) {
      return res.status(404).json({
        success: false,
        message: "Category ID is required"
      });
    }
  }
  catch(error) {
    console.error(`add categories error - ${error}`);
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in add categories -> ${req.ip} - Error ${error}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}