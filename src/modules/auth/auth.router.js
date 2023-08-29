import { Router } from "express";
import { isValid } from "../../middleware/validation.middleware.js";
import { activateAccount, getUser, login, logoutHandler, refreshTokenHandler, register, resetPassword, sendForgetCode } from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { activateSchema, forgetCodeSchema, loginSchema, registerSchema, resetPasswordSchema } from "./auth.validation.js";
const router = Router();

router.post("/register", isValid(registerSchema), asyncHandler(register));

router.get("/confirmEmail/:activationCode", isValid(activateSchema), activateAccount);


router.post("/login", isValid(loginSchema), asyncHandler(login));
router.get("/getuser", asyncHandler(getUser));
router.get("/refresh", asyncHandler(refreshTokenHandler));
router.get("/logout", asyncHandler(logoutHandler));
router.patch("/forgetCode", isValid(forgetCodeSchema), asyncHandler(sendForgetCode));


router.patch("/resetPassword", isValid(resetPasswordSchema), asyncHandler(resetPassword));



export default router;