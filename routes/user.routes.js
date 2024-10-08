const express = require("express");
const router = express.Router();
// const path = require("path");
// const fs = require("fs");
// const multer = require("../middlewares/multer");
const userController = require("../controllers/userController");
const { verifyJWT } = require("../middlewares/jwt");
// const directoryPath = path.join(__dirname, "..", "resources", "videos");

// fs.mkdirSync(directoryPath, { recursive: true });
// const upload = multer.setFile({
//   maxFileSize: 50 * 1024 * 1024,
//   path: directoryPath,
//   mimetypes: ["video/mp4", "video/mkv", "video/avi", "video/mov"],
// });

// router.post("/upload/post", upload.single("video"), userController.uploadPost);
// router.post("/subscribe/channel");
router.get("/channel/profile", verifyJWT, userController.getUserChannelProfile);
module.exports = router;
