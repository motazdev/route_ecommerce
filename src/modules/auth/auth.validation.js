import joi from "joi";

export const registerSchema = joi.object({
    userName: joi.string().min(3).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    gender: joi.string().valid("male", "female").insensitive().messages({
        "string.required": "Gender is required",
        "string.base": "Gender must be a string",
        "any.only": "Gender must be Male or Female",
    }),
    address: joi.any()
});


export const activateSchema = joi.object({
    activationCode: joi.string().required()
}).required();


export const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});


export const forgetCodeSchema = joi.object({
    email: joi.string().email().required()
});


export const resetPasswordSchema = joi.object({
    forgetCode: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
});