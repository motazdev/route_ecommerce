import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObj } from "../../utils/multer.js";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "./category.validation.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { allCategs, createCategory, deleteCategory, updateCategory } from "./category.controller.js";
import subCategoryRouter from "../subcategory/subcategory.router.js";
import ProductRouter from "../product/product.router.js";
const router = Router();

// create categ
router.post("/", isAuthenticated, isAuthorized("admin"), fileUpload(filterObj.image).single("category"), isValid(createCategorySchema), asyncHandler(createCategory));

router.patch("/:categoryId",
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload(filterObj.image).single("category"),
    isValid(updateCategorySchema),
    asyncHandler(updateCategory));

router.delete("/:categoryId",
    isAuthenticated,
    isAuthorized("admin"),
    isValid(deleteCategorySchema), deleteCategory);


router.get("/", allCategs);

router.use("/:categoryId/subcategory", subCategoryRouter);
router.use("/:categoryId/product", ProductRouter);


export default router;