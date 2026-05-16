import {User} from '../models/user.model.js';
import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/api-error.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return next(new ApiError(401,"Unauthorized: No token provided"));
    }
    try {
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decoded._id).select("-password");
        req.user=user;
        next();
    } catch (error) {
        return next(new ApiError(401,"Unauthorized: Invalid token"));
    }
})