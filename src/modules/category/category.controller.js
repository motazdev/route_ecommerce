import slugify from "slugify";
import cloudinary from "../../utils/cloud.js";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";

export const createCategory = async (req, res, next) => {
  const { name } = req.body;
  if (!req.file) return next(new Error("Image is required", { cause: 400 }));
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER}/category`,
    }
  );
  const category = await Category.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
  });

  return res.status(201).json({ success: true, results: category });
};

export const updateCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("Category not found"));
  if (req.user._id.toString() !== category.createdBy.toString()) {
    return next(new Error("You are not authorized"));
  }

  if (req.file) {
    console.log("replacing...");
    const results = await cloudinary.uploader.destroy(category.image.id);

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: category.image.id,
      }
    );
    category.image.url = secure_url;
  }

  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;
  await category.save();
  return res.json({ success: true, message: "category updated successfully" });
};

// delete category
export const deleteCategory = async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("invalid category id!"));

  //  check owner
  if (req.user._id.toString() !== subcategory.createdBy.toString())
    return next(new Error("You are not authorized"));

  // delete image
  const results = await cloudinary.uploader.destroy(category.image.id);

  // delete category
  // await category.remove();
  await Category.findByIdAndDelete(req.params.categoryId);

  // delete subcategories
  await Subcategory.deleteMany({ categoryId: category._id });

  // send response
  return res.json({ success: true, message: "category deleted" });
};

export const allCategs = async (req, res, next) => {
  const categories = await Category.find().populate({
    path: "subcategory",
    populate: [{ path: "createdBy" }], // nested populate
  });

  return res.json({ success: true, categories });
};
