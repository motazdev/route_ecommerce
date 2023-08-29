import slugify from "slugify";
import cloudinary from "../../utils/cloud.js";
import { Brand } from "../../../DB/models/brand.model.js";


export const createBrand = async (req, res, next) => {
    const { name } = req.body;
    if (!req.file) return next(new Error("Image is required", { cause: 400 }));
    const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
        req.file.path, {
        folder: `${process.env.CLOUD_FOLDER}/brand`
    });
    console.log("process.env.CLOUD_FOLDER > ", process.env.CLOUD_FOLDER);
    const brand = await Brand.create({
        name: req.body.name,
        slug: slugify(name),
        createdBy: req.user._id,
        image: { id: public_id, url: secure_url }
    });

    return res.status(201).json({ success: true, results: brand });

};


export const updateBrand = async (req, res, next) => {
    const brand = await Brand.findById(req.params.brandId);
    if (!brand) return next(new Error("Brand not found"));

    if (req.user._id.toString() !== brand.createdBy.toString()) {
        return next(new Error("You are not authorized"));
    }


    if (req.file) {
        console.log("replacing...");
        const results = await cloudinary.uploader.destroy(brand.image.id);

        const { public_id, secure_url } = await cloudinary.v2.uploader.upload(req.file.path, {
            public_id: brand.image.id,
        });
        brand.image.url = secure_url;

    }

    brand.name = req.body.name ? req.body.name : brand.name;
    brand.slug = req.body.name ? slugify(req.body.name) : brand.slug;
    await brand.save();
    return res.json({ success: true, message: "brand updated successfully" });

};


export const deleteBrand = async (req, res, next) => {
    const brand = await Brand.findById(req.params.brandId);
    if (!brand) return next(new Error("Brand not found"));
    // delete image from cloudinary

    const results = await cloudinary.uploader.destroy(brand.image.id);
    if (results.result == 'ok') {
        console.log(results);
        await Brand.deleteOne({ _id: req.params.brandId });
    }

    return res.json({ success: true, message: "brand deleted successfully" });

};






export const allCategs = async (req, res, next) => {
    const categories = await Brand.find().populate({
        path: "subbrand",
        populate: [{ path: "createdBy" }] // nested populate
    });
    console.log(categories);

    return res.json({ success: true, categories });

};