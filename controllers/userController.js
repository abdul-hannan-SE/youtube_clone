// const { validationResult } = require("express-validator");
// const { clearFile } = require("../utils/common");
// const Post = require("../models/post.model");
// const fs = require("fs");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const User = require("../models/user.model");
const { default: mongoose } = require("mongoose");
const Subscription = require("../models/subscription.model");

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.query;
  const channel = await User.aggregate([
    { $match: { username: username } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        subscribersCount: 1,
        isSubscribed: 1,
        channelSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        subscribers: 1,
      },
    },
  ]);

  if (!channel?.length) throw new ApiError(404, "channel dose not exists");
  res
    .status(200)
    .json(new ApiResponse(200, "User cahnnel fetched", channel[0]));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Schema.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "video",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "user",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                    username: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },

    {
      $project: {
        watchHistory: 1,
        username: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!user?.length) {
    throw new ApiError(404, "watch history could not found");
  }
  res.status(200).json(new ApiResponse(200, "Channel profile fetched"));
});

module.exports = { getUserChannelProfile, getWatchHistory };
