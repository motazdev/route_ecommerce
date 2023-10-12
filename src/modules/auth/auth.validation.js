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
  address: joi.any(),
});

export const activateSchema = joi
  .object({
    activationCode: joi.string().required(),
  })
  .required();

export const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.base": `Please enter a valid email address`,
    "string.empty": `Please enter a valid email address`,
    "any.required": `Please enter a valid email address`,
    "string.email": `Please enter a valid email address`,
  }),
  password: joi.string().min(6).max(20).required().messages({
    "string.empty": `Please enter a valid password`,
    "string.min": `Password must be at least 6 characters long`,
    "string.max": `Password must be at most 20 characters long`,
    "any.required": `Please enter a valid password`,
  }),
});

export const forgetCodeSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.base": `Please enter a valid email address`,
    "string.empty": `Please enter a valid email address`,
    "any.required": `Please enter a valid email address`,
    "string.email": `Please enter a valid email address`,
  }),
});

export const resetPasswordSchema = joi.object({
  code: joi.string().required(),
  password: joi.string().min(6).max(20).required(),
  confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
    "string.base": `Please enter a valid password`,
    "any.only": `Password doesn't match`,
  }),
});
export const changePasswordSchema = joi.object({
  currentPassword: joi.string().min(6).max(20).required().messages({
    "string.empty": `Please enter a valid password`,
    "string.min": `Password must be at least 6 characters long`,
    "string.max": `Password must be at most 20 characters long`,
    "any.required": `Please enter a valid password`,
  }),
  password: joi.string().min(6).max(20).required().messages({
    "string.empty": `Please enter a valid password`,
    "string.min": `Password must be at least 6 characters long`,
    "string.max": `Password must be at most 20 characters long`,
    "any.required": `Please enter a valid password`,
  }),
  confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
    "string.base": `Please enter a valid password`,
    "any.only": `Password doesn't match`,
  }),
});

export const updateAddressSchema = joi.object({
  address: joi.string().required(),
  phone: joi.string().length(14).required(),
});
