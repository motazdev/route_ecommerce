import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObj } from "../../utils/multer.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createSubCategorySchema, deleteSubCategorySchema, updateSubCategorySchema } from "./subcategory.validation.js";
import { allSubCategs, createSubCategory, deleteSubCategory, updateSubCategory } from "./subcategory.controller.js";
const router = Router({ mergeParams: true });


router.post("/", isAuthenticated, isAuthorized("admin"), fileUpload(filterObj.image).single("subcategory"), isValid(createSubCategorySchema), asyncHandler(createSubCategory));


router.patch("/:subCategoryId",
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload(filterObj.image).single("subcategory"),
    isValid(updateSubCategorySchema),
    asyncHandler(updateSubCategory));

router.delete("/:subCategoryId",
    isAuthenticated,
    isAuthorized("admin"),
    isValid(deleteSubCategorySchema), deleteSubCategory);


router.get("/", allSubCategs);


export default router;