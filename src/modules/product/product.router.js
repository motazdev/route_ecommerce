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
import { productIdSchema, updateProductSchema } from "./product.validation.js";
const router = Router({ mergeParams: true });

router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObj.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
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

export default router;
