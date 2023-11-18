import cloudinary from "../../utils/cloud.js";
import { nanoid } from "nanoid";
import { Product } from "../../../DB/models/product.model.js";
import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { Brand } from "../../../DB/models/brand.model.js";

export const addProduct = async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  if (!category) return next(new Error("category not found"));

  const subcategory = await Subcategory.findById(req.body.subcategory);
  if (!subcategory) return next(new Error("subcategory not found"));

  if (subcategory.categoryId.toString() !== category._id.toString()) {
    return next(new Error("subcategory not listed in this category"));
  }

  const brand = await Brand.findById(req.body.brand);
  if (!brand) return next(new Error("brand not found"));
  if (!req.files)
    return next(new Error("Product Image is required", { cause: 400 }));
  // create unique folder name
  const cloudFolder = nanoid();
  const images = [];
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
      file.path,
      {
        folder: `${process.env.CLOUD_FOLDER}/products/${cloudFolder}`,
      }
    );
    images.push({ id: public_id, url: secure_url });
  }

  const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
    req.files.defaultImage[0].path,
    {
      folder: `${process.env.CLOUD_FOLDER}/products/${cloudFolder}`,
    }
  );

  const product = await Product.create({
    ...req.body,
    slug: slugify(req.body.name),
    cloudFolder,
    createdBy: req.user._id,
    defaultImage: { url: secure_url, id: public_id },
    images, // [{id: , url:  }, {id: , url:  }, {id: , url:  }]
  });

  return res.status(201).json({ success: true, result: product });
};

export const allProducts = async (req, res, next) => {
  if (req.query.search) {
    const foundProduct = await Product.find({
      name: { $regex: req.query.search, $options: "i" },
    }).populate(["brand", "category", "subcategory"]);

    return res.json({ success: true, results: foundProduct });
  }
  const limit = req.query.limit ? req.query.limit : 0;

  if (req.params.categorySlug) {
    const category = await Category.find({ slug: req.params.categorySlug });
    if (!category) return next(new Error("Category not found", { cause: 404 }));
    const products = await Product.find({ category: req.params.categorySlug })
      .paginate(req.query.page, limit)
      .customSelect(req.query.fields)
      .sort(req.query.sort)
      .populate(["brand", "category", "subcategory"]);
    return res.json({ success: true, result: products });
  }
  const priceMin = req.query.pricemn && req.query.pricemn;
  const priceMax = req.query.pricemx && req.query.pricemx;

  if (priceMax && priceMin) {
    const products = await Product.find({
      $and: [
        {
          price: {
            $gte: priceMin,
          },
        },
        {
          price: {
            $lte: priceMax,
          },
        },
      ],
    })
      .paginate(req.query.page, limit)
      .customSelect(req.query.fields)
      .sort(req.query.sort)
      .populate(["brand", "category", "subcategory"]);
    return res.json({ success: true, products });
  }

  const products = await Product.find({ ...req.query })
    .paginate(req.query.page, limit)
    .customSelect(req.query.fields)
    .sort(req.query.sort)
    .populate(["brand", "category", "subcategory"]);

  return res.json({ success: true, products });
};

export const singleProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) return next(new Error("Product not found", { cause: 404 }));

  return res.json({ success: true, results: product });
};

// Update Product
export const updateProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new Error("Product not found"));
  if (
    req.user.role != "admin" &&
    req.user._id.toString() !== product.createdBy.toString()
  ) {
    return next(new Error("You are not authorized"));
  }
  if (req.files.defaultImage) {
    const results = await cloudinary.uploader.destroy(product.defaultImage.id);
    if (results.result === "ok") {
      const { public_id, secure_url } = await cloudinary.v2.uploader.upload(
        req.files.defaultImage[0].path,
        {
          public_id: product.defaultImage.id,
          overwrite: true,
        }
      );

      product.defaultImage.id = public_id;
      product.defaultImage.url = secure_url;
    } else {
      console.log("image not found to be deleted");
    }
  }

  product.name = req.body.name ? req.body.name : product.name;
  product.category = req.body.category ? req.body.category : product.category;
  product.subcategory = req.body.subcategory
    ? req.body.subcategory
    : product.subcategory;
  product.availableItems = req.body.availableItems
    ? req.body.availableItems
    : product.availableItems;
  product.price = req.body.price ? req.body.price : product.price;
  if (!req.body.discount || req.body.discount == 0) {
    await Product.findByIdAndUpdate(product._id, {
      $unset: {
        discount: 1,
      },
    });
  } else {
    product.discount = req.body.discount;
  }

  product.description = req.body.description
    ? req.body.description
    : product.description;
  product.slug = req.body.name ? slugify(req.body.name) : product.slug;
  await product.save();
  return res.json({ success: true, message: "Product Updated Successfully" });
};
