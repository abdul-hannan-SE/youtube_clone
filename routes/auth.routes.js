const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const multer = require("../middlewares/multer");
const path = require("path");
const { check } = require("express-validator");
const fs = require("fs");
const { verifyJWT } = require("../middlewares/jwt");
const directoryPath = path.join(
  __dirname,
  "..",
  "resources",
  "images",
  "profile_pics"
);

fs.mkdirSync(directoryPath, { recursive: true });

const upload = multer.setFile({
  maxFileSize: 1 * 1024 * 1024,
  path: directoryPath,
});

// router.get("/user", authController.getUser);

router.post(
  "/signUp",
  upload.single("profile"),
  [
    check("email")
      .trim()
      .isEmail()
      .escape()
      .withMessage("E-mail address invalid"),
    check("password")
      .notEmpty()
      .isLength({ min: 6, max: 12 })
      .withMessage("Password should be 6-12 char long"),
    check("username")
      .notEmpty()
      .withMessage("Username cannot be empty")
      .isLength({ min: 6, max: 15 })
      .withMessage("Username must be between 6 and 15 characters long")
      .matches(/^[a-zA-Z][a-zA-Z0-9 ]*$/)
      .withMessage(
        "Username should not start with a number and can only contain alphanumeric characters"
      ),
  ],
  authController.signUp
);

router.post(
  "/login",
  [
    check("email")
      .trim()
      .isEmail()
      .escape()
      .withMessage("E-mail address invalid"),
    check("password")
      .notEmpty()
      .isLength({ min: 6, max: 12 })
      .withMessage("Password should be 6-12 char long"),
  ],
  authController.login
);

router.post("/logOut", verifyJWT, authController.logOut);

module.exports = router;
