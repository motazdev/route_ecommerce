import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) => {

    return Types.ObjectId.isValid(value) ? true : helper.message('Invalid Object ID');
};

export const createOrderSchema = joi.object({
    productId: joi.string().custom(validateObjectId).required(),
    quantity: joi.number().integer().min(1).required(),
    address: joi.string().min(5).required(),
    coupon: joi.string().length(5),
    phone: joi.string().required(),
    // phone: joi.string().required().regex("^(\+201|01|00201)[0-2,5]{1}[0-9]{8}"),
    payment: joi.string().valid("cash", "visa").required(),

}).required();




export const cancelOrderSchema = joi.object({
    orderId: joi.string().custom(validateObjectId).required(),

}).required();


