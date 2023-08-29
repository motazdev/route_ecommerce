import { User } from "../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import randomstring from "randomstring";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmails.js";
import { confirmEmail } from "../../utils/templates/confirmEmail.js";
import { Token } from "../../../DB/models/token.model.js";
export const register = async (req, res, next) => {
    const { userName, email, password } = req.body;
    const isExist = await User.findOne({ email });

    if (isExist) return next(new Error("Email already existed !", { cause: 409 }));

    const hashPassword = bcryptjs.hashSync(password, parseInt(process.env.SALTROUND));

    const activationCode = crypto.randomBytes(64).toString("hex");

    const user = await User.create({ email, userName, password: hashPassword, activationCode });
    const link = `http://localhost:${process.env.PORT}/auth/confirmEmail/${activationCode}`;
    const html = confirmEmail(link, userName);
    // const isSent = await sendEmail({ to: email, subject: "Activate Your Account", html });
    // console.log(isSent);
    // return isSent ? res.json({ success: true, message: "Please review your email !" })
    //     : next(new Error("Somthing went wrong"));
    sendEmail({ to: email, subject: "Activate Your Account", html });
    return res.json({ success: true, message: "Please review your email !" });

};

export const activateAccount = async (req, res, next) => {
    const { activationCode } = req.params;
    const user = await User.findOneAndUpdate({ activationCode }, {
        isConfirmed: true,
        $unset: { activationCode: 1 }
    });
    if (!user) return next(new Error("User not found", { cause: 400 }));

    return res.send("Congratulations, Your account is now activated successfully! Try to login..");

};


export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error("User not found", { cause: 404 }));
    console.log(user);
    if (!user.isConfirmed) return next(new Error("Please activate your account first..", { cause: 400 }));
    const match = bcryptjs.compareSync(password, user.password);
    if (!match) return next(new Error("Invalid password"));

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_TOKEN,
        { expiresIn: "2d" }
    );
    const refreshToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_TOKEN,
        { expiresIn: "2d" }
    );
    await Token.create({
        token,
        user: user._id,
        agent: req.headers["user-agent"],
        expiredAt: jwt.verify(token, process.env.JWT_TOKEN).exp
    });
    user.refreshToken = refreshToken;
    user.staus = 'online';
    await user.save();
    // res.cookie(String(user._id), token, {
    //     path: '/',
    //     expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    //     httpOnly: true,
    //     sameSite: 'lax'
    // });
    res.cookie(`jwt`, refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

    return res.json({ success: true, token, authUserState: user });
};

export const refreshTokenHandler = async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return next("Not authorized", { cause: 401 });
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).select("-password -updatedAt");
    if (!foundUser) return res.status(403);

    jwt.verify(
        refreshToken, process.env.JWT_TOKEN,
        async (err, decoded) => {
            console.log("err", err);
            console.log("foundUser.email: ", foundUser.email);
            console.log("decoded.email: ", decoded.email);
            if (err || foundUser.email !== decoded.email) return res.status(403).json({ success: false });

            const accessToken = jwt.sign(
                { "email": decoded.email },
                process.env.JWT_TOKEN,
                { expiresIn: "2d" }
            );
            // const newToken = await Token.findOneAndUpdate({ user: foundUser._id }, { accessToken });
            // console.log(newToken);
            return res.json({ accessToken, userData: foundUser });
        });

};


export const logoutHandler = async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(204);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken });
    console.log("Ss");
    if (!foundUser) {
        console.log("ffff");
        res.clearCookie("jwt", { httpOnly: true });
        return res.status(204);
    }
    console.log("aaa");

    const deleteRefreshToken = await User.findOneAndUpdate({ email: foundUser.email }, { refreshToken: "" });
    res.clearCookie("jwt", { httpOnly: true }); // secure: true on production
    res.json({ success: true }); // OK but no content
};

export const verifyToken = (req, res, next) => {
    const cookies = req.headers.cookie;
    const token = cookies?.split("=")[1];
    if (!token) {
        res.status(404).json({ message: "No token found" });
    }
    jwt.verify(String(token), process.env.JWT_TOKEN, (err, user) => {
        if (err) {
            return next(new Error("Invalid Token", { cause: 400 }));
        }
        console.log("user.id > ", user.id);
        req.id = user.id;
    });
    next();
};

export const getUser = async (req, res, next) => {
    // const userId = req.id;
    let user = await User.find();
    // try {
    //     user = await User.findById(userId, "-password");
    // } catch (err) {
    //     return new Error(err);
    // }
    // if (!user) {
    //     return res.status(404).json({ messsage: "User Not FOund" });
    // }
    return res.status(200).json({ user });
};


export const sendForgetCode = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Email not found", { cause: 404 }));
    const forgetCode = randomstring.generate({
        length: 5,
        charset: "numeric"
    });

    user.forgetCode = forgetCode;
    await user.save();
    const html = confirmEmail("asfasf", "Asfs");
    const isSent = await sendEmail({ to: email, subject: "Reset Password", html });
    return isSent ? res.json({ success: true, message: "Code sent to your email !" })
        : next(new Error("Somthing went wrong"));

};


export const resetPassword = async (req, res, next) => {
    const { forgetCode, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Email not found", { cause: 404 }));

    if (user.forgetCode !== forgetCode) {
        return next(new Error("Invalid Code", { cause: 400 }));
    }

    await User.findOneAndUpdate({ forgetCode }, {
        $unset: {
            forgetCode: 1
        }
    });

    const hashPassword = bcryptjs.hashSync(password, Number(process.env.SALTROUND));

    user.password = hashPassword;
    user.status = "offline";
    await user.save();

    const tokens = await Token.find({ user: user._id });

    tokens.forEach(async (token) => {
        token.isValid = false;
        await token.save();
    });

    return res.json({ success: true, message: "Try to login again" });

};