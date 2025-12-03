import Joi from "joi";

export const addProductSchema = Joi.object({
  productName: Joi.string().required().min(4).max(60).trim().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name should have at least 4 characters",
    "string.max": "Product name should not exceed over 60 characters",
  }),
  productBrand: Joi.string().required().min(4).max(16).messages({
    "string.empty": "Product brand is required",
    "string.min": "Product brand should at least 4 characters",
    "string.max": "Product brand should not exceed over 16 characters"
  }),
  productPrice: Joi.number().required().min(1).max(1000000).messages({
    "number.empty": "Product price is required",
    "number.min": "Product price should at least 1 characters",
    "number.max": "Product price should at least 5 characters",
  }),
  productTags: Joi.array().min(1).max(10).messages({
    "array.min": "Product tags should at least 1 characters",
    "array.max": "Product tags should at least 10 characters",
  }),
  productCategory: Joi.string().required().min(1).max(10).messages({
    "string.empty": "Product category is required",
    "string.min": "Product category should at least 1 characters",
    "string.max": "Product category should at least 10 characters",
  }),
  productDesc: Joi.string().required().min(4).max(80).messages({
    "string.empty": "Product description is required",
    "string.min": "Product description should at least 4 characters",
    "string.max": "Product description should at least 80 characters",
  }),
  productStock: Joi.number().min(1).max(200).required().messages({
    "number.empty": "Product stock is required",
    "number.min": "Product stock should at least 1 characters",
    "number.max": "Product stock should at least 200 characters",
  })
});