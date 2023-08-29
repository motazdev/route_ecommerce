import joi from "joi";
import { Types, isValidObjectId } from "mongoose";

const validateObjectId = (value, helper) => {

    return Types.ObjectId.isValid(value) ? true : helper.message('Invalid Object ID');
};

export const createProductSchema = joi.object({
    name: joi.string().min(2).max(50).required(),
    description: joi.string(),
    availableItems: joi.number().min(1).required(),
    price: joi.number().min(1).required(),
    discount: joi.number().min(1),
    category: joi.string().custom(validateObjectId),
    subcategory: joi.string().custom(isValidObjectId),
    brand: joi.string().custom(isValidObjectId)

});


export const updateProductSchema = joi.object({
    name: joi.string().min(3).max(20),
    categoryId: joi.string().custom(validateObjectId).required()

}).required();


// delete product + read single product
export const productIdSchema = joi.object({
    productId: joi.string().custom(validateObjectId).required()

}).required();