import path from "path";
import cloudinary from "../../utils/cloud.js";
import { Product } from "../../../DB/models/product.model.js";
import { Cart } from "../../../DB/models/cart.model.js";
import { Coupon } from "../../../DB/models/coupon.model.js";
import { Order } from "../../../DB/models/order.model.js";
import { createInvoice } from "../../utils/createInvoice.js";
import { fileURLToPath } from "url";
import { sendEmail } from "../../utils/sendEmails.js";
import { clearCart, updateStock } from "./order.service.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createOrder = async (req, res, next) => {
  const { payment, address, phone, coupon } = req.body;

  let checkCoupon;
  if (coupon) {
    checkCoupon = await Coupon.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
    if (!coupon) return next(new Error("Invalid coupon"));
  }

  const cart = await Cart.findOne({ user: req.user._id });

  const products = cart.products;
  if (products.length < 1) return next(new Error("Empty cart"));
  let orderProducts = [];
  let orderPrice = 0;

  for (let i = 0; i < products.length; i++) {
    const product = await Product.findById(products[i].productId);
    if (!product)
      return next(new Error(`Product ${products[i].name} not found`));
    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `${product.name} out of stock, only ${product.availableItems} are left.`
        )
      );

    orderProducts.push({
      productId: product._id,
      quantity: products[i].quantity,
      name: product.name,
      itemPrice: product.finalPrice,
      totalPrice: products[i].quantity * product.finalPrice,
    });

    orderPrice += products[i].quantity * product.finalPrice;
  }

  // MOTAZDEV ON UPWORK //

  const order = await Order.create({
    user: req.user._id,
    products: orderProducts,
    address,
    phone,
    ...(checkCoupon?.discount && {
      coupon: {
        id: checkCoupon?._id,
        name: checkCoupon?.name,
        discount: checkCoupon?.discount,
      },
    }),
    payment,
    price: orderPrice,
  });
  // generate invoice
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };

  const pdfPath = path.join(
    __dirname,
    `./../../../invoiceTemp/${order._id}.pdf`
  );

  let secure_url;
  let public_id;
  createInvoice(invoice, pdfPath, async () => {
    const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
      pdfPath,
      {
        folder: `${process.env.CLOUD_FOLDER}/order/invoice/${user._id}`,
      },
      function (error, result) {
        console.log("error : ", error);
        console.log("result : ", result);
      }
    );
    secure_url = secure_url;
    public_id = public_id;
  });

  order.invoice = { id: public_id, url: secure_url };
  await order.save();

  const isSent = await sendEmail({
    to: user.email,
    subject: "Order Invoice",
    attachments: [
      {
        path: secure_url,
        contentType: "application/pdf",
      },
    ],
  }).then(() => {
    console.log("hhhhhhhhhhhh");
    updateStock(order.products, true);
    clearCart(user._id);
  });
  console.log("isSent : ", isSent);
  // if (isSent) {
  //   updateStock(order.products, true);
  //   clearCart(user._id);
  // }

  if (payment == "visa") {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    let existCoupon;

    if (order.coupon.name !== undefined) {
      // coupon created by stripe
      existCoupon = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: { order_id: order._id.toString() },
      success_url: `http://localhost:8000/order/success?session_id={CHECKOUT_SESSION_ID}`,
      // success_url: process.env.SUCCESS_URL,http://localhost:8000/order/success?session_id={CHECKOUT_SESSION_ID}
      cancel_url: process.env.CANCEL_URL,
      // line_items: [{
      //     price_data: {
      //         currency: ,
      //         product_data: {name: , images: },
      //         unit_amount: // price of one item
      //     },
      //     quantity:
      // }], // array of objects [{}, {}, {}]
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              // images: [product.productId.defaultImage.url]
            },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: existCoupon ? [{ coupon: existCoupon.id }] : [],
    });

    return res.json({ success: true, result: session.url });
  }

  return res.json({
    success: true,
    message: "order placed successfully, please check your email",
  });
};

export const successOrder = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);

  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  if (!session) return next(new Error("Session Error"));
  const customer = await stripe.customers.retrieve(session.customer);
  console.log("customer: ", customer);
  if (!customer) return next(new Error("Customer Error"));

  res.send(
    `<html><body><h1>Thanks for your order, ${customer.name}!</h1></body></html>`
  );
};

export const cancelOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new Error("Order not found"), { cause: 404 });

  if (order.status === "shipped" || order.status === "delivered") {
    return next(new Error("Order can not be canceled"));
  }
  updateStock(order.products, false);
  order.status = "canceled";
  await order.save();

  return res.json({ success: true, message: "Order canceled successfully" });
};

export const webhook = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const orderId = event.data.object.metadata.order_id;
  if (event.type === "checkout.session.completed") {
    await Order.findOneAndUpdate({ _id: orderId }, { status: "payed" });
    return;
  }

  await Order.findOneAndUpdate({ _id: orderId }, { status: "failed to pay" });
  return;
};
