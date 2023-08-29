import mongoose, { Schema, Types, model, mongo } from "mongoose";
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },
    slug: {
        type: String
    },
    description: {
        type: String,
    },
    images: [
        {
            id: { type: String, required: true },
            url: { type: String, required: true }
        }
    ],
    defaultImage: {
        id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    availableItems: {
        type: Number,
        min: 1,
        required: true
    },
    soldItems: {
        type: Number, default: 0
    },
    price: {
        type: Number, min: 1, required: true
    },
    discount: {
        type: Number,
        min: 1,
        max: 100,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: Types.ObjectId,
        ref: "Category",
        required: true
    },
    subcategory: {
        type: Types.ObjectId,
        ref: "Subcategory",
        required: true
    },
    brand: {
        type: Types.ObjectId,
        ref: "Brand",
        required: true
    },
    cloudFolder: {
        type: String,
        unique: true,
        required: true

    }
}, { timestamps: true, strictQuery: true, toJSON: { virtuals: true } });

productSchema.virtual("finalPrice").get(function () {
    if (this.price) {
        return Number.parseFloat(
            this.price - (this.price * this.discount || 0) / 100
        );
    }
});


// query helper

productSchema.query.paginate = function (page, limit) {
    // const limit = 2;
    page = !page || page < 1 || isNaN(page) ? 1 : page;
    const skip = (page - 1) * limit;
    console.log("skip: ", skip);
    console.log("page: ", page);

    // this >>> query
    // should return query
    return this.skip(skip).limit(limit);

    // const products = await Product.find().skip().limit(limit);
};



productSchema.query.customSelect = function (fields) {
    if (!fields) return this;
    const queryKeys = fields.split(" ");
    console.log(queryKeys);
    // model keys
    // console.log(Product.schema.paths); // {_id: , name: , ....}
    const modelKeys = Object.keys(Product.schema.paths);
    console.log(modelKeys);

    //mathcedKeys
    const matchedKeys = queryKeys.filter((key) => modelKeys.includes(key));
    console.log("matchedKeys > ", matchedKeys);
    return this.select(matchedKeys);


    // const products = await Product.find().select(matchedKeys);

};


// stock function

productSchema.methods.inStock = function (requiredQuantity) {

    return this.availableItems >= requiredQuantity ? true : false;
};


export const Product = mongoose.models.Product || model('Product', productSchema);