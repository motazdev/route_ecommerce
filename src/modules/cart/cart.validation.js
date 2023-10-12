import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid Object ID");
};

export const CartSchema = joi
  .object({
    // productId: joi.string().custom(validateObjectId).required(),
    productId: joi.string().required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

export const removeProductFromCartSchema = joi
  .object({
    productId: joi.string().custom(validateObjectId).required(),
  })
  .required();
