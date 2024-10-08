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

  const { username, email, password, fullName } = req.body;
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
    fullName: fullName,
  });

  if (!req.files || !req.files.avatar) {
    throw new ApiError(400, "Avatar image is required.");
  }
  newUser.avatar =
    "http://localhost:3000/resources/images/" + req.files.avatar.filename;
  if (req.files.coverImage) {
    newUser.coverImage =
      "http://localhost:3000/resources/images/" + req.files.coverImage.filename;
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

const updateAvatarImage = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    // Check if avatar file is attached
    if (!req.file) {
      throw new ApiError(
        404,
        "Avatar image file is not attached",
        "Multer error"
      );
    }

    // Prepare paths for the new avatar and cover image
    const newAvatarPath =
      "http://localhost:3000/resources/images/" + req.file.filename;
    const oldAvatarPath = user.avatar?.replace(
      "http://localhost:3000/resources/images/",
      ""
    );

    user.avatar = newAvatarPath; // Update the user's avatar

    // Save the user profile without validation
    await user.save({ validateBeforeSave: false });

    // Clear the old avatar file
    if (oldAvatarPath) {
      clearFile(
        path.join(
          __dirname,
          "..",
          "resources",
          "images",
          "profile_pics",
          oldAvatarPath
        )
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile picture updated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to update profile picture",
      "Internal error",
      error
    );
  }
});

const updateCoverImage = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    // Check if avatar file is attached
    if (!req.file) {
      throw new ApiError(
        404,
        "Cover image file is not attached",
        "Multer error"
      );
    }
    const newCoverImagePath =
      "http://localhost:3000/resources/images/" + req.files.coverImage.filename;
    const oldCoverImagePath = user.coverImage?.replace(
      "http://localhost:3000/resources/images/",
      ""
    );
    user.coverImage = newCoverImagePath; // Update the user's cover image
    await user.save({ validateBeforeSave: false });
    // Clear the old cover image if it exists
    if (oldCoverImagePath) {
      clearFile(
        path.join(
          __dirname,
          "..",
          "resources",
          "images",
          "profile_pics",
          oldCoverImagePath
        )
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Cover Image updated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to update profile picture",
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
  changePassword,
  updateUserProfile,
  updateAvatarImage,
  updateCoverImage,
};
