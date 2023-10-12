import mongoose, { Schema, Types, model } from "mongoose";
const productsCartSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);
const cartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [productsCartSchema],
  },
  { timestamps: true, strictQuery: true, toJSON: { virtuals: true } }
);

cartSchema.virtual("checkoutTotal").get(function () {
  if (this.products.length > 0) {
    let total = 0;
    for (const item of this.products) {
      total = total + item.productId.finalPrice * item.quantity;
    }
    return Number.parseFloat(total);
  }
});

export const Cart = mongoose.models.Cart || model("Cart", cartSchema);
