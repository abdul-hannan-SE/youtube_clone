const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const User = require("../models/user.model");
const { default: mongoose } = require("mongoose");
const Subscription = require("../models/subscription.model");

const toggleSubscription = asyncHandler(async (req, res) => {
  const userId = req.user?._id; // Assumes user is authenticated and `req.user` holds the user information
  const channelId = req.params.channelId;

  // Check if the user is already subscribed to the channel
  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    // If the subscription exists, unsubscribe (delete the subscription)
    await existingSubscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed from channel"));
  } else {
    // If the subscription doesn't exist, create a new one (subscribe)
    const newSubscription = new Subscription({
      subscriber: userId,
      channel: channelId,
    });
    await newSubscription.save();
    return res.status(201).json(new ApiResponse(201, "Subscribed to channel"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const test = await Subscription.findOne({
    channel: channelId,
  });

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Schema.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              avatar: 1,
              fullName: 1,
              username: 1,
            },
          },
          {
            $addFields: {
              channels: {
                $first: "$channels",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!subscribers?.length) {
    throw new ApiError(404, "Could not find subscribers");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Channel subscribers fetched", subscribers[0]));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Schema.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              _id: 1,
              fullName: 1,
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "channels",
    },
  ]);

  if (!subscribedChannels?.length) {
    throw new ApiError(404, "Could not find subscribers");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Channels fetched successfully", subscribedChannels)
    );
});

module.exports = {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
