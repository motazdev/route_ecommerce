import slugify from "slugify";
import cloudinary from "../../utils/cloud.js";
import { Category } from "../../../DB/models/category.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { Cart } from "../../../DB/models/cart.model.js";

export const addToCart = async (req, res, next) => {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return next(new Error("product not found", { cause: 404 }));

    // if (quantity > product.avaliableItems) return next(new Error(`Sorry, Only ${product.avaliableItems} items left on the stock`, { cause: 404 }));
    if (!product.inStock(quantity)) {
        return next(new Error(`Sorry, Only ${product.availableItems} items left on the stock`, { cause: 404 }));
    }
    // const cart = await Cart.findOne({ user: req.user._id });
    // cart.products.push({ productId, quantity });
    // await cart.save();


    const isProductInCart = await Cart.findOne({
        user: req.user._id,
        "products.productId": productId
    });
   if (isProductInCart) {
    isProductInCart.products.forEach((productObj) => {
      if (
        productObj.productId.toString() === productId.toString() &&
        productObj.quantity + quantity < product.availableItems
      ) {
        productObj.quantity = productObj.quantity + quantity;
      }
    });
    await isProductInCart.save();
    // response
    return res.json({
      success: true,
      results: isProductInCart,
      message: "Product added successfully!",
    });
  }  else {
        const cart = await Cart.findOneAndUpdate(
          { user: req.user._id },
          { $push: { products: { productId, quantity } } },
          { new: true }
        );
        // response
        return res.json({
          success: true,
          results: cart,
          message: "Product added successfully!",
        });
      }

};


export const userCart = async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: "products.productId",
            select: "name defaultImage.url price discount finalPrice"
        });

    return res.json({ success: true, results: cart });
};



export const updateCart = async (req, res, next) => {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return next(new Error("product not found", { cause: 404 }));

    if (quantity > product.avaliableItems) return next(new Error(`Sorry, Only ${product.avaliableItems} items left on the stock`, { cause: 404 }));


    const cart = await Cart.findOneAndUpdate({ user: req.user._id, "products.productId": productId }, {
        $set: {
            "products.$.quantity": quantity
        }
    }, { new: true });

    return res.json({ success: true, results: cart });
};



export const removeProductFromCart = async (req, res, next) => {

    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, {
        $pull: {
            products: {
                productId: req.params.productId
            }
        }
    }, { new: true });

    return res.json({ success: true, results: cart, message: "Product removed successfully" });
};


export const clearCart = async (req, res, next) => {

    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { products: [] }, { new: true });

    return res.json({ success: true, message: "Cart cleared successfully" });
};