import voucher_codes from "voucher-code-generator";
import { Coupon } from "../../../DB/models/coupon.model.js";
export const createCoupon = async (req, res, next) => {
  const code = voucher_codes.generate({ length: 5 }); // []

  const coupon = await Coupon.create({
    name: code[0],
    discount: req.body.discount,
    expiredAt: new Date(req.body.expiredAt).getTime(), // 09/20/2023
    createdBy: req.user._id,
  });
  return res.status(201).json({ success: true, results: coupon });
};

export const updateCoupon = async (req, res, next) => {
  const coupon = await Coupon.findOne({
    name: req.params.code,
    expiredAt: {
      $gt: Date.now(),
    },
  });
  if (!coupon) return next(new Error("coupon not found"));
  if (req.user._id !== coupon.createdBy.toString())
    return next(new Error("You are not authorized"));

  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expiredAt = req.body.expiredAt
    ? new Date(req.body.expiredAt)
    : coupon.expiredAt;
  await coupon.save();
  return res.json({ success: true, msg: "Coupon Updated Successfully" });
};

export const deleteCoupon = async (req, res, next) => {
  const coupon = await Coupon.findOne({
    name: req.params.code,
  });
  if (!coupon) return next(new Error("coupon not found"));

  if (req.user._id !== coupon.createdBy.toString())
    return next(new Error("You are not authorized"));

  await Coupon.findByOneAndDelete({ name: req.params.code });
  return res.json({ success: true, msg: "Coupon Deleted Successfully" });
};

export const allCoupons = async (req, res, next) => {
  const coupons = await Coupon.find();
  return res.json({ success: true, results: coupons });
};

export const applyCoupon = async (req, res, next) => {
  const { code } = req.body;
  const checkCoupon = await Coupon.findOne({
    name: code,
    expiredAt: { $gt: Date.now() },
  });
  if (!checkCoupon) return next(new Error("Invalid coupon"));



  return res.json({ success:true, coupon: checkCoupon, message: "Coupon Applied Successfully !" });
};
