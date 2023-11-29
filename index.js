import dotenv from "dotenv";
import express from "express";
import { appRouter } from "./src/app.router.js";
import { connectDB } from "./DB/connection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cookieParser());
dotenv.config();
app.use(
  cors({
    origin: "https://route-ecommerce-react.vercel.app",
    credentials: true,
  })
);

const port = process.env.PORT;

connectDB();

appRouter(app, express);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
