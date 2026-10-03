import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully and verification email has been sent on your email",
      ),
    );
});
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Verification link is invalid or has expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password,username} = req.body;
  if(!email || !username){
    throw new ApiError(422,"Email and username is required to login");
  }
  const user=await User.findOne({
    email,
  });
  if(!user){
    throw new ApiError(404,"User not found");
  }
  const isPasswordCorrect=await user.isPasswordCorrect(password);
  if(!isPasswordCorrect){
    throw new ApiError(401,"Invalid credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    })
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken,user:{email:user.email,username:user.username} },
        "User logged in successfully",
      ),
    );

});
const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {$set:{refreshToken:""}, },
    {new:true},
  );
  const options={
    httpOnly:true,
    secure:true,
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
})
const forgotPassword=asyncHandler(async(req,res)=>{
  const {email}=req.body;
  if(!email){
    throw new ApiError(422,"Email is required");
  }
  const user=await User.findOne({email});
  if(!user){
    throw new ApiError(404,"User not found");
  }
  const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();
  user.forgotPasswordToken=hashedToken;
  user.forgotPasswordExpiry=tokenExpiry;
  await user.save({validateBeforeSave:false});
  await sendEmail({
    email:user.email,
    subject:"Reset your password",
    mailgenContent:forgotPasswordMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unHashedToken}`,
    ),
  });
  return res.status(200).json(new ApiResponse(200,null,"Password reset link has been sent to your email"));
})
const resetPassword=asyncHandler(async(req,res)=>{
  const {token}=req.params;
  const {newPassword}=req.body;
  if(!newPassword){
    throw new ApiError(422,"New password is required");
  }
  const hashedToken=crypto.createHash("sha256").update(token).digest("hex");
  const user=await User.findOne({
    forgotPasswordToken:hashedToken,
    forgotPasswordExpiry:{$gt:Date.now()},
  });
  if(!user){
    throw new ApiError(400,"Reset password link is invalid or has expired");
  }
  user.password=newPassword;
  user.forgotPasswordToken=undefined;
  user.forgotPasswordExpiry=undefined;
  await user.save();
  return res.status(200).json(new ApiResponse(200,null,"Password has been reset successfully"));
})

export { registerUser, verifyEmail, loginUser, logoutUser, forgotPassword, resetPassword };
