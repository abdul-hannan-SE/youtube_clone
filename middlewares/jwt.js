// In your middleware file (e.g., jwt.js)
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
require("dotenv").config();

exports.verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Access Token not found", "JWT Error");
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        throw new ApiError(401, "Authentication Failed", "JWT Error");
      } else {
        const user = await User.findById(decodedToken?._id).select("-refreshToken -__v");
        if (!user) {
          throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
      }
    });
  } catch (err) {
    next(err); // Pass the error to the error handler
  }
});
