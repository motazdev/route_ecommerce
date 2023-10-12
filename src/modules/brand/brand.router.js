import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObj } from "../../utils/multer.js";
import { createBrandSchema, deleteBrandSchema, updateBrandSchema } from "./brand.validation.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { allBrands, createBrand, deleteBrand, updateBrand } from "./brand.controller.js";
const router = Router();


router.post("/", isAuthenticated, isAuthorized("admin"), fileUpload(filterObj.image).single("brand"), isValid(createBrandSchema), asyncHandler(createBrand));

router.patch("/:brandId",
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload(filterObj.image).single("brand"),
    isValid(updateBrandSchema),
    asyncHandler(updateBrand));

router.delete("/:brandId",
    isAuthenticated,
    isAuthorized("admin"),
    isValid(deleteBrandSchema), deleteBrand);


router.get("/", allBrands);



export default router;