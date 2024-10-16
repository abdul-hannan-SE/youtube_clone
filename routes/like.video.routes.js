const express = require("express");
const router = express.Router();
const likeController = require("../controllers/like.controller");

router.post("/toggle/video/like", likeController.toggleVideoLike);
router.post("/toggle/comment/like", likeController.toggleCommentLike);
router.get("/get/liked/videos", likeController.getLikedVideos);
module.exports = router;
