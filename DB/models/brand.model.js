import mongoose, { Schema, Types, model } from "mongoose";

const brandSchema = new Schema({
    name: {
        type: String,
        min: 3,
        max: 20,
        required: true,
        unique: true
    },
    slug: {
        type: String
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    categoryId: {
        type: Types.ObjectId,
        ref: "Category"
    },
    brandId: {
        type: Types.ObjectId,
        ref: "Brand"
    },
    image: {
        url: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


export const Brand = mongoose.models.Brand || model('Brand', brandSchema);