import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  cancelOrder,
  createOrder,
  successOrder,
  webhook,
} from "./order.controller.js";
import Stripe from "stripe";

const router = Router();
import express from "express";
// TODO
/*
    2 endpoints for create order > one for "visa" one for "cash"
*/

router.post(
  "/",
  isAuthenticated,
  isValid(createOrderSchema),
  asyncHandler(createOrder)
);

// cancel order
router.patch(
  "/:orderId",
  isAuthenticated,
  isValid(cancelOrderSchema),
  asyncHandler(cancelOrder)
);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(webhook)
);

router.get("/success", asyncHandler(successOrder));
export default router;
