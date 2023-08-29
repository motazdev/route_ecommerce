import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { cancelOrder, createOrder } from "./order.controller.js";
const router = Router();



router.post("/",
    isAuthenticated,
    isValid(createOrderSchema),
    asyncHandler(createOrder)
);


// cancel order
router.patch("/:orderId", isAuthenticated, isValid(cancelOrderSchema), asyncHandler(cancelOrder));

export default router;