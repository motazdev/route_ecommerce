import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema({
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
    brandId: {
        type: Types.ObjectId,
        ref: "Brand"
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

categorySchema.virtual('subcategory', {
    ref: "Subcategory",
    localField: '_id',
    foreignField: 'categoryId'
});

categorySchema.pre("remove", {document: true, query: false} ,async function() {
    await Subcategory.deleteMany({categoryId: this._id})
})
export const Category = mongoose.models.Category || model('Category', categorySchema);