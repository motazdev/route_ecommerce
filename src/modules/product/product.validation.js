import joi from "joi";
import { Types, isValidObjectId } from "mongoose";

const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid Object ID");
};

export const createProductSchema = joi.object({
  name: joi.string().min(2).max(50).required(),
  description: joi.string(),
  availableItems: joi.number().min(1).required(),
  price: joi.number().min(1).required(),
  status: joi.string().valid("published", "inactive").insensitive().messages({
    "string.required": "status is required",
    "string.base": "status must be a string",
    "any.only": "status must be Active or Inactive",
  }),
  discount: joi.number().min(1),
  category: joi.string().custom(validateObjectId),
  subcategory: joi.string().custom(isValidObjectId),
  brand: joi.string().custom(isValidObjectId),
});

export const updateProductSchema = joi.object({
  productId: joi.string().custom(validateObjectId).required(),
  name: joi.string().min(2).max(50),
  price: joi.number().min(1),
  availableItems: joi.number().min(1),
  discount: joi.number().min(0),
  description: joi.string(),
  status: joi.string().valid("published", "inactive").insensitive().messages({
    "string.required": "status is required",
    "string.base": "status must be a string",
    "any.only": "status must be Active or Inactive",
  }),
  category: joi.string().custom(validateObjectId),
  subcategory: joi.string().custom(validateObjectId),
  brand: joi.string().custom(validateObjectId),
});

// delete product + read single product
export const productIdSchema = joi
  .object({
    productId: joi.string().custom(validateObjectId).required(),
  })
  .required();
