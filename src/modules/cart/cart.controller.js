import slugify from "slugify";
import cloudinary from "../../utils/cloud.js";
import { Category } from "../../../DB/models/category.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { Cart } from "../../../DB/models/cart.model.js";

export const addToCart = async (req, res, next) => {
  // data id, qty
  const { productId, quantity } = req.body;

  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // check stock
  // if (quantity > product.availableItems)
  //   return next(
  //     new Error(
  //       `Sorry, only ${product.availableItems} items left on the stock!`
  //     )
  //   );
  if (!product.inStock(quantity)) {
    return next(
      new Error(
        `Sorry, only ${product.availableItems} items left on the stock!`,
        { cause: 400 }
      )
    );
  }

  // add to cart

  //   const cart = await Cart.findOne({ user: req.user._id });
  //   cart.products.push({ productId, quantity });
  //   await cart.save();

  // check the product existence in the cart >> // TODO
  console.log("CART USER: ", req.user.email);

  const isProductInCart = await Cart.findOne({
    user: req.user._id,
    "products.productId": productId,
  }).populate({
    path: "products.productId",
    select:
      "name defaultImage.url price slug discount finalPrice category subcategory",
    populate: {
      path: "category",
      select: "name",
    },
  });
  if (isProductInCart) {
    let stockError = false;
    try {
      isProductInCart.products.forEach((productObj) => {
        if (productObj.productId._id.toString() === productId.toString()) {
          if (productObj.quantity + quantity <= product.availableItems) {
            productObj.quantity = productObj.quantity + quantity;
          } else {
            throw new Error(
              `Sorry, only ${product.availableItems} items left on the stock!`,
              { cause: 400 }
            );
            // return next(
            //   new Error(
            //     `Sorry, only ${product.availableItems} items left on the stock!`, {cause: 400}
            //   )
            // );
          }
        }
      });
    } catch (error) {
      return next(new Error(error.message));
    }

    await isProductInCart.save();
    // response
    return res.json({
      success: true,
      cart: isProductInCart,
      message: "Product added successfully!",
    });
  } else {
    const test = await Cart.findOne({ user: req.user._id });

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          products: { productId, quantity },
        },
      },
      { new: true }
    ).populate({
      path: "products.productId",
      select:
        "name defaultImage.url price slug discount finalPrice category subcategory ",
      populate: {
        path: "category",
        select: "name",
      },
    });
    // response
    return res.json({
      success: true,
      cart,
      message: "Product added successfully!",
    });
  }
};

export const userCart = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "products.productId",
    select:
      "name defaultImage.url price slug discount finalPrice category subcategory availableItems",
    populate: {
      path: "category",
      select: "name",
    },
  });

  return res.json({ success: true, cart });
};

export const updateCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found", { cause: 404 }));
  if (quantity > product.availableItems)
    return next(
      new Error(
        `Sorry, Only ${product.availableItems} items left on the stock`,
        { cause: 400 }
      )
    );

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id, "products.productId": productId },
    {
      $set: {
        "products.$.quantity": quantity,
      },
    },
    { new: true }
  ).populate({
    path: "products.productId",
    select:
      "name defaultImage.url price slug discount finalPrice category subcategory",
    populate: {
      path: "category",
      select: "name",
    },
  });

  return res.json({ success: true, cart });
};

export const removeProductFromCart = async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        products: {
          productId: req.params.productId,
        },
      },
    },
    { new: true }
  ).populate({
    path: "products.productId",
    select:
      "name defaultImage.url price slug discount finalPrice category subcategory",
    populate: {
      path: "category",
      select: "name",
    },
  });

  return res.json({
    success: true,
    cart,
    message: "Product removed successfully",
  });
};

export const clearCart = async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );

  return res.json({ success: true, message: "Cart cleared successfully" });
};
