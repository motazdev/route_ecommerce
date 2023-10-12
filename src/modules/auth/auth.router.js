import { Router } from "express";
import { isValid } from "../../middleware/validation.middleware.js";
import {
  activateAccount,
  changePassword,
  getUser,
  login,
  logoutHandler,
  refreshTokenHandler,
  register,
  resetPassword,
  sendForgetCode,
  updateCheckoutInfo,
} from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  activateSchema,
  changePasswordSchema,
  forgetCodeSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateAddressSchema,
} from "./auth.validation.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post("/register", isValid(registerSchema), asyncHandler(register));

router.get(
  "/confirmEmail/:activationCode",
  isValid(activateSchema),
  activateAccount
);

router.post("/login", isValid(loginSchema), asyncHandler(login));
router.get("/getuser", asyncHandler(getUser));
router.get("/refresh", asyncHandler(refreshTokenHandler));
router.get("/logout", asyncHandler(logoutHandler));
router.patch(
  "/forgetCode",
  isValid(forgetCodeSchema),
  asyncHandler(sendForgetCode)
);

router.patch(
  "/updateinfo",
  isAuthenticated,
  isValid(updateAddressSchema),
  asyncHandler(updateCheckoutInfo)
);

router.patch(
  "/resetPassword",
  isValid(resetPasswordSchema),
  asyncHandler(resetPassword)
);

router.patch(
  "/changePassword",
  isAuthenticated,
  isValid(changePasswordSchema),
  asyncHandler(changePassword)
);

export default router;
