const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { ApiError } = require("../utils/ApiError");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      set: (value) => value.substring(0, 20),
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email must be Unique"],
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    imageUrl: { type: String, required: [true, "Image is required"] },
  },
  { timestanps: true }
);

userSchema.pre("save", function () {
  if (!this.isModified("password"))
    this.password = bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN, {
    expiresIn: "1d",
  });
};

module.exports = mongoose.model("User", userSchema);
