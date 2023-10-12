import dotenv from "dotenv";
import express from "express";
import { appRouter } from "./src/app.router.js";
import { connectDB } from "./DB/connection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// CUSTOM CORS MIDDLEWARE //
// const whiteList = ["http://localhost:8000"];
// app.use((req, res, next) => {
//   if (req.originalUrl.includes("/auth/confirmEmail")) {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET");
//     return next();
//   }
//   if (!whiteList.includes(req.header("origin"))) {
//     return next(new Error("Blocked By Cors"));
//   } else {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     res.setHeader("Access-Control-Allow-Methods", "*");
//     res.setHeader("Access-Control-Allow-Private-Network", true); // allow localhost to access the backend if the backend is deployed
//     return next();
//   }
// });

app.use(cookieParser());
dotenv.config();
app.use(cors({ origin: "http://localhost:8000", credentials: true }));

const port = process.env.PORT;

connectDB();

appRouter(app, express);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
