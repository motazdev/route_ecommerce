import mongoose, { Schema, Types, model } from "mongoose";



const subCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        min: 4,
        max: 20
    },
    slug: {
        type: String
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
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
    },
    categoryId: {
        type: Types.ObjectId,
        required: true,
        ref: "Category"
    }
}, {
    timestamps: true
});

export const Subcategory = mongoose.models.Subcategory || model('Subcategory', subCategorySchema);
