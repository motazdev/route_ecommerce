import mongoose, { Schema, Types } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "user", "seller"],
      default: "user",
    },
    forgetCode: String,
    activationCode: String,
    profilePic: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dm02ysnsx/image/upload/v1690897812/Route-Ecommerce/users/defaultPP.png",
      },
      id: { type: String, default: "Route-Ecommerce/users/defaultPP" },
    },
    coverPics: [
      {
        url: { type: String },
        id: { type: String },
      },
    ],
    address: String,
    phone: String,
    refreshToken: String,
    cart: {
      type: Types.ObjectId,
      ref: "Cart",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(
      this.password,
      Number(process.env.SALTROUND)
    );
  }
});

userSchema.pre("findOneAndUpdate", async function () {
  if (this._update.password) {
    const user = await this.model.findOne(this.getQuery());
    console.log("user.passworddd:: ", user.password);
    this.set({
      password: bcryptjs.hashSync(
        this._update.password,
        Number(process.env.SALTROUND)
      ),
    });

    this.set({ updatedAt: new Date() });
  }
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
