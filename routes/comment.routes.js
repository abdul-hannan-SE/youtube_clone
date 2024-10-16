const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");

router.post("/add", commentController.addComment);
router.post("/delete", commentController.deleteComment);
router.get("/get/video/comments", commentController.getVideoComments);
router.put("/update", commentController.updateComment);

module.exports = router;
