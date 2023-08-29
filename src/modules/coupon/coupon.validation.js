import joi from "joi";
import { Types, isValidObjectId } from "mongoose";

const validateObjectId = (value, helper) => {

    return Types.ObjectId.isValid(value) ? true : helper.message('Invalid Object ID');
};

export const createCouponSchema = joi.object({
    discount: joi.number().min(1).max(100).required(),
    expiredAt: joi.date().greater(Date.now()).required()
});


export const updateCouponSchema = joi.object({
    code: joi.string().length(5).required(),
    discount: joi.number().min(1).max(100),
    expiredAt: joi.date().greater(Date.now())
});



export const deleteCouponSchema = joi.object({
    code: joi.string().length(5).required(),
});
