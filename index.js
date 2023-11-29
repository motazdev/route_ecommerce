import dotenv from "dotenv";
import express from "express";
import { appRouter } from "./src/app.router.js";
import { connectDB } from "./DB/connection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cookieParser());
dotenv.config();
// app.use(
//   cors({
//     origin: [
//       "http://localhost:8000",
//       "https://route-ecommerce-react.vercel.app",
//     ],
//     credentials: true,
//   })
// );
app.use(function (req, res, next) {
  var allowedDomains = [
    "http://localhost:8000",
    "https://route-ecommerce-react.vercel.app",
  ];
  var origin = req.headers.origin;
  if (allowedDomains.indexOf(origin) > -1) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});
const port = process.env.PORT;

connectDB();

appRouter(app, express);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
