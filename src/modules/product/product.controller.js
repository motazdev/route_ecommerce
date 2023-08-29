import cloudinary from "../../utils/cloud.js";
import { nanoid } from 'nanoid';
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
    if (!req.files) return next(new Error("Product Image is required", { cause: 400 }));
    // create unique folder name
    const cloudFolder = nanoid();
    const images = [];
    for (const file of req.files.subImages) {
        const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
            file.path, {
            folder: `${process.env.CLOUD_FOLDER}/products/${cloudFolder}`
        });
        images.push({ id: public_id, url: secure_url });
    }

    const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
        req.files.defaultImage[0].path, {
        folder: `${process.env.CLOUD_FOLDER}/products/${cloudFolder}`
    });


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
    console.log("req.params > ", req.params);
    console.log("req > ", req.query);
    if (req.params.categoryId) {
        const category = await Category.findById(req.params.categoryId);
        if (!category) return next(new Error("Category not found", { cause: 404 }));
        const products = await Product.find({ category: req.params.categoryId });
        return res.json({ success: true, result: products });

    }
    const limit = req.query.limit ? req.query.limit : 0;
    const products = await Product.find({ ...req.query }).paginate(req.query.page, limit).customSelect(req.query.fields).sort(req.query.sort);

    return res.json({ success: true, products });
};

export const singleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.productId);

    if (!product) return next(new Error("Product not found", { cause: 404 }));

    return res.json({ success: true, results: product });
};