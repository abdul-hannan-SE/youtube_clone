const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channel.controller");
const { verifyJWT } = require("../middlewares/jwt");
// Route to get channel statistics
router.get("/get/stats", verifyJWT, channelController.getChannelStats);

// Route to get all videos uploaded by the channel
router.get("/get/videos", verifyJWT, channelController.getChannelVideos);

module.exports = router;
