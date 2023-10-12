import dotenv from "dotenv";
dotenv.config();
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: "dm02ysnsx",
  api_key: "349435139862114",
  api_secret: process.env.API_SECRET,
});

export default cloudinary;
