const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channel.controller");

// Route to get channel statistics
router.get("/get/stats", channelController.getChannelStats);

// Route to get all videos uploaded by the channel
router.get("/get/videos", channelController.getChannelVideos);

module.exports = router;
