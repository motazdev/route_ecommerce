import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { allCoupons, createCoupon, deleteCoupon, updateCoupon } from "./coupon.controller.js";
import { createCouponSchema, deleteCouponSchema, updateCouponSchema } from "./coupon.validation.js";
const router = Router();


router.post("/",
    isAuthenticated,
    isAuthorized("admin"),
    isValid(createCouponSchema),
    asyncHandler(createCoupon)
);

router.patch("/:code",
    isAuthenticated,
    isAuthorized("admin"),
    isValid(updateCouponSchema),
    asyncHandler(updateCoupon)
);
router.delete("/:code",
    isAuthenticated,
    isAuthorized("admin"),
    isValid(deleteCouponSchema),
    asyncHandler(deleteCoupon)
);


router.get("/", allCoupons);


export default router;