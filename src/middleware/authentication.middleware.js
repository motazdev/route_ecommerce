import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Token } from "../../DB/models/token.model.js";
import { User } from "../../DB/models/user.model.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  // let token = req.headers["token"];
  let token = req.headers["token"] || req.cookies.jwt;
  // req.cookies.jwt ? token =`${process.env.BEARER_KEY}${token}` : token
  console.log("req.headers ::::::::::, ", req.headers);
  console.log("req.TOKENNNN >>>>>>>>>, ", req.headers["token"]);
  console.log("process.env.BEARER_KEY, ", process.env.BEARER_KEY);
  if (!token || !token.startsWith(process.env.BEARER_KEY))
    return next(new Error("Valid token is required"));

  token = token.split(process.env.BEARER_KEY)[1];
  const decoded = jwt.verify(token, process.env.JWT_TOKEN);
  if (!decoded) return next(new Error("Token is invalid", { cause: 401 }));

  const tokenDB = await Token.findOne({ token, isValid: true });
  if (!tokenDB) return next(new Error("Expired Token", { cause: 401 }));

  const user = await User.findOne({ email: decoded.email });
  if (!user) return next(new Error("User not found", { cause: 401 }));

  req.user = user;
  return next();
});
