import slugify from "slugify";
import cloudinary from "../../utils/cloud.js";
import { Category } from "../../../DB/models/category.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { Cart } from "../../../DB/models/cart.model.js";
import { Review } from "../../../DB/models/review.model.js";

export const addReview = async (req, res, next) => {
   
  // content, prodId, user

  const {content, productId} = req.body;

  const product = await Product.findById(productId)
  if(!product) return next(new Error("Product not found"))

  const review = await Review.create({
    user: req.user._id,
    content
  })

  product.reviews.push({reviewId: review._id})
  await product.save()

  return req.json({success: true})

};


