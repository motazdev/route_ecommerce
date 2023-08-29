import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) => {

    return Types.ObjectId.isValid(value) ? true : helper.message('Invalid Object ID');
};

export const createCategorySchema = joi.object({
    name: joi.string().min(3).max(20).required(),

}).required();


export const updateCategorySchema = joi.object({
    name: joi.string().min(3).max(20),
    categoryId: joi.string().custom(validateObjectId).required()

}).required();

export const deleteCategorySchema = joi.object({
    categoryId: joi.string().custom(validateObjectId).required()

}).required();