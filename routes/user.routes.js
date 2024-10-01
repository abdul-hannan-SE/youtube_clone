const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("../middlewares/multer");
const userController = require("../controllers/userController");
const directoryPath = path.join(__dirname, "..", "resources", "videos");

fs.mkdirSync(directoryPath, { recursive: true });
const upload = multer.setFile({
  maxFileSize: 50 * 1024 * 1024,
  path: directoryPath,
  mimetypes: ["video/mp4", "video/mkv", "video/avi", "video/mov"],
});

router.post("/upload/post", upload.single("video"), userController.uploadPost);

module.exports = router;
