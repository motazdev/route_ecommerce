import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) => {

    return Types.ObjectId.isValid(value) ? true : helper.message('Invalid Object ID');
};

export const createSubCategorySchema = joi.object({
    name: joi.string().min(3).max(20).required(),
    categoryId: joi.string().custom(validateObjectId).required()
}).required();


export const updateSubCategorySchema = joi.object({
    name: joi.string().min(3).max(20),
    categoryId: joi.string().custom(validateObjectId).required()

}).required();

export const deleteSubCategorySchema = joi.object({
    categoryId: joi.string().custom(validateObjectId).required()

}).required();