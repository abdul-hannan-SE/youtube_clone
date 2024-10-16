const path = require("path");
const fs = require("fs");
const multer = require("../middlewares/multer");
const { verifyJWT } = require("../middlewares/jwt");
const videoController = require("../controllers/video.controller");
const directoryPath = path.join(__dirname, "..", "resources", "videos");
const express = require("express");
const router = express.Router();

fs.mkdirSync(directoryPath, { recursive: true });
const upload = multer.setFile({
  maxFileSize: 50 * 1024 * 1024,
  path: directoryPath,
  mimetypes: ["video/mp4", "video/mkv", "video/avi", "video/mov"],
});

router.post(
  "/upload",
  verifyJWT,
  upload.single("video"),
  videoController.uploadPost
);

module.exports = router;
