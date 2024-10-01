const User = require("../models/user.model");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { clearFile } = require("../utils/common");

const signUp = asyncHandler(async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const message = new Error(err.array()[0].msg);
    throw new ApiError(422, message, "Vaalidation Error");
  }

  const { username, email, password } = req.body;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    throw new ApiError(
      500,
      "Error durring password encryption",
      "Bcrypt Error"
    );
  }

  const newUser = new User({
    username: username,
    email: email,
    password: hashedPassword,
  });
  if (req.file) {
    newUser.imageUrl =
      "http://localhost:3000/resources/images/" + req.file.filename;
  } else {
    throw new ApiError(400, "Image is required,");
  }
  await newUser.save();
  return res.status(201).json(
    new ApiResponse(200, "User created successfully", {
      username: newUser.username,
      email: newUser.email,
      _id: newUser._id,
    })
  );
});

const generateAccessAndRefreshToken = async (user) => {
  try {
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token",
      "JWT Error"
    );
  }
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("-__v");
  if (!user) {
    throw new ApiError(404, "User with given email not exists");
  }
  const result = await user.isPasswordValid(password);
  if (!result) {
    throw new ApiError(401, "Invalid password", "Validation Error");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user
  );
  // only modifiable by server
  const options = {
    secure: true,
    httpOnly: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Login successful", {
        user: user._doc,
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );
});

const logOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged Out success"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refreshToken");
    }
    if (incomingRefreshToken !== user.refreshToken)
      throw new ApiError("Refresh Token expired or used");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, "Token refreshed"));
  });
});

const updateProfilePic = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    if (!req.file) {
      throw new ApiError(404, "Image file is not attached", "Multer error");
    }
    const oldImagePath = req.user.imageUrl.replace(
      "http://localhost:3000/resources/images/",
      ""
    );
    const imageUrl =
      "http://localhost:3000/resources/images/" + req.file.filename;
    await user.save({ validateBeforeSave: false });
    clearFile(
      path.join(
        __dirname,
        "..",
        "resources",
        "images",
        "profile_pics",
        oldImagePath
      )
    );
    return res.status(200).json(new ApiResponse(200, "Profile pic updated"));
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to update profile pic",
      "Internal error",
      error
    );
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = req.user;
  const { newPassword, oldPassword } = req.body;
  const isValid = await user.isPasswordValid(oldPassword);
  if (!isValid) throw new ApiError(401, "Incorrect password provided");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, "Password changed"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { email, username } = req.body;
  const user = req.user;
  user.email = email;
  user.username = username;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, "Profile updated"));
});

module.exports = {
  signUp,
  login,
  logOut,
  refreshToken,
  updateProfilePic,
  changePassword,
  updateUserProfile,
};
