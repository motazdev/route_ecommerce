import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { cancelOrder, createOrder, webhook } from "./order.controller.js";
const router = Router();



router.post("/",
    isAuthenticated,
    isValid(createOrderSchema),
    asyncHandler(createOrder)
);



// cancel order
router.patch("/:orderId", isAuthenticated, isValid(cancelOrderSchema), asyncHandler(cancelOrder));

router.post("/webhook",
    express.raw({type: 'application/json'}),
    asyncHandler(webhook)
);
export default router;