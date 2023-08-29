import { asyncHandler } from "../utils/asyncHandler.js";

export const isAuthorized = (role) => {
    return asyncHandler(async (req, res, next) => {
        if (req.user.role != role) return next(new Error("Not authorized", { cause: 403 }));
        return next();
    });
};