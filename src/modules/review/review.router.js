import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addReview } from "./review.controller.js";
const router = Router();


// add prod to cart

router.post("/", isAuthenticated,
asyncHandler(addReview));

export default router;