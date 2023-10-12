import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { CartSchema, removeProductFromCartSchema } from "./cart.validation.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addToCart, clearCart, removeProductFromCart, updateCart, userCart } from "./cart.controller.js";
const router = Router();


// add prod to cart

router.post("/", isAuthenticated, isValid(CartSchema), asyncHandler(addToCart));

router.get("/", isAuthenticated, asyncHandler(userCart));
router.patch("/", isAuthenticated, isValid(CartSchema), asyncHandler(updateCart));

router.patch("/clear", isAuthenticated, asyncHandler(clearCart));

router.patch("/:productId", isAuthenticated, isValid(removeProductFromCartSchema), asyncHandler(removeProductFromCart));
export default router;