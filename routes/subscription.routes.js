const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");

// Toggle subscription (subscribe/unsubscribe from a channel)
router.post("/toggle", subscriptionController.toggleSubscription);

// Get all subscribers for a channel
router.get(
  "/get/channel/subscribers",
  subscriptionController.getUserChannelSubscribers
);

// Get all channels a user is subscribed to
router.get(
  "/get/subscribed/channels",
  subscriptionController.getSubscribedChannels
);

module.exports = router;
