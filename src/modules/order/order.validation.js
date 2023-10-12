import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) => {

    return Types.ObjectId.isValid(value) ? true : helper.message('Invalid Object ID');
};

export const createOrderSchema = joi.object({
    address: joi.string().min(10).required(),
    coupon: joi.string().length(5),
    phone: joi.string().length(14).required(),
    payment: joi.string().valid("cash", "visa").required(),
}).required();




export const cancelOrderSchema = joi.object({
    orderId: joi.string().custom(validateObjectId).required(),

}).required();


