import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { sendEmail } from "../utils/mail.js";
const generateAccessandRefreshTokens=async(userId)=>{
    try{
       const user=await User.findById(userId);
       const access=user.generateAccessToken();
       const refresh=user.generateRefreshToken();
       user.refreshToken=refresh;
       await user.save({validateBeforeSave:false})
       return {access,refresh};
    }
    catch(error){
        throw new ApiError(500,"Something is wrong in generating tokens");
    }
}
const registerUser=asyncHandler(async(req,res)=>{
   const {email,username,password,role}= req.body;
   const existed=await User.findOne({
    $or:[{username,email}]
   })
   if(existed){
    throw new ApiError(409,"User with email or username exists");
   }
   const user=await User.create({
    email,
    password,
    username,
    isEmailVerified:false
   })
   const {unHashed,TokenExpiry}=user.generateTemporaryToken();
   user.emailVerificationToken=unHashed;
   user.emailVerificationExpiry=TokenExpiry;
   await user.save({validateBeforeSave:false});
   await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  })
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

})