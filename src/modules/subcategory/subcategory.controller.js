import slugify from "slugify";
import cloudinary from "../../utils/cloud.js";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";


export const createSubCategory = async (req, res, next) => {
    const { name } = req.body;
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return next(new Error("Category not found"), { cause: 404 });
    if (!req.file) return next(new Error("Image is required", { cause: 400 }));
    const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
        req.file.path, {
        folder: `${process.env.CLOUD_FOLDER}/subcategory`
    });

    const subcategory = await Subcategory.create({
        name: req.body.name,
        slug: slugify(name),
        createdBy: req.user._id,
        image: { id: public_id, url: secure_url },
        categoryId
    });

    return res.status(201).json({ success: true, results: subcategory });

};


export const updateSubCategory = async (req, res, next) => {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return next(new Error("Category not found"));

    const subcategory = await Subcategory.findById(req.params.subCategoryId);
    if (!subcategory) return next(new Error("SubCategory not found"));
    if (req.user._id.toString() !== category.createdBy.toString()) {
        return next(new Error("You are not authorized"));
    }
    if (req.file) {
        const results = await cloudinary.uploader.destroy(subcategory.image.id);

        const { public_id, secure_url } = await cloudinary.v2.uploader.upload(req.file.path, {
            public_id: subcategory.image.id,
        });
        subcategory.image.url = secure_url;

    }

    subcategory.name = req.body.name ? req.body.name : subcategory.name;
    subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;
    await subcategory.save();
    return res.json({ success: true, message: "subcategory updated successfully" });

};


export const deleteSubCategory = async (req, res, next) => {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return next(new Error("Category not found"));

    const subcategory = await Subcategory.findByIdAndDelete(req.params.subCategoryId);
    if (!subcategory) return next(new Error("SubCategory not found"));
    // delete image from cloudinary

    const results = await cloudinary.uploader.destroy(subcategory.image.id);
    if (results.result == 'ok') {
        console.log(results);
        await Subcategory.deleteOne({ _id: req.params.subCategoryId });
    }

    return res.json({ success: true, message: "subcategory deleted successfully" });

};






export const allSubCategs = async (req, res, next) => {
    const subCategories = await Subcategory.find().populate([
        {
            path: "categoryId"
        },
        {
            path: 'createdBy'
        }
    ]);

    return res.json({ success: true, subCategories });

};