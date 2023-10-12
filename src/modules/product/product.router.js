import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObj } from "../../utils/multer.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  addProduct,
  allProducts,
  singleProduct,
  updateProduct,
} from "./product.controller.js";
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "./product.validation.js";
const router = Router({ mergeParams: true });

router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObj.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
  //   isValid(createProductSchema),
  asyncHandler(addProduct)
);

router.patch(
  "/:productId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObj.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
  isValid(updateProductSchema),
  asyncHandler(updateProduct)
);

router.get("/", allProducts);
router.get("/single/:productId", isValid(productIdSchema), singleProduct);

// read products of specefic categories

// update product 2 endpoints or more > update images, name price discount

// router.patch("/:subCategoryId",
//     isAuthenticated,
//     isAuthorized("admin"),
//     fileUpload(filterObj.image).single("subcategory"),
//     isValid(updateProductSchema),
//     asyncHandler(updateSubCategory));

// router.delete("/:subCategoryId",
//     isAuthenticated,
//     isAuthorized("admin"),
//     isValid(deleteProductSchema), deleteSubCategory);

// router.get("/", allSubCategs);

export default router;
