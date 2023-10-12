import authRouter from "./modules/auth/auth.router.js";
import categoryRouter from "./modules/category/category.router.js";
import subCategoryRouter from "./modules/subcategory/subcategory.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import productRouter from "./modules/product/product.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import reviewRouter from "./modules/review/review.router.js";
import morgan from "morgan";
export const appRouter = (app, express) => {
  // app.use(express.json());

  app.use((req, res, next) => {
    if (req.originalUrl.includes("/order/webhook")) return next();

    express.json()(req, res, next);
  });

  if (process.env.NODE_ENV == "dev") {
    app.use(morgan(process.env.NODE_ENV));
  }
  app.use("/auth", authRouter);
  app.use("/category", categoryRouter);
  app.use("/subcategory", subCategoryRouter);
  app.use("/brand", brandRouter);
  app.use("/product", productRouter);
  app.use("/coupon", couponRouter);
  app.use("/cart", cartRouter);
  app.use("/order", orderRouter);
  app.use("/review", reviewRouter);

  app.all("*", (req, res, next) => {
    return next(new Error("Page not found", { cause: 404 }));
  });

  app.use((error, req, res, next) => {
    return res.status(error.cause || 500).json({
      success: false,
      error,
      message: error.message,
      stack: error.stack,
    });
  });
};
