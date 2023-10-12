// clear cart

import { Cart } from "../../../DB/models/cart.model.js";
import { Product } from "../../../DB/models/product.model.js";

export const clearCart = async (userId) => {
  console.log("CLEAREDDD CARTTTT");
  await Cart.findOneAndUpdate({ user: userId }, { products: [] });
};

// update stock

export const updateStock = async (products, placeOrder) => {
  if (placeOrder) {
    for (const product of products) {
      await Product.findByIdAndUpdate(products.productId, {
        $inc: {
          // availableItems: placeOrder ? -product.quantity : product.quantity,
          availableItems: -product.quantity,
          solidItems: product.quantity,
        },
      });
    }
  } else {
    for (const product of products) {
      await Product.findByIdAndUpdate(products.productId, {
        $inc: {
          availableItems: product.quantity,
          solidItems: -product.quantity,
        },
      });
    }
  }
};
