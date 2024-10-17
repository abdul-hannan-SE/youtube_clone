const mongoose = require("mongoose");
const Video = require("../models/video.model.js"); // Remove curly braces for default exports
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const User = require("../models/user.model.js");

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const channelId = req?.user._id;
  const channel_stats = await User.aggregate([
    { $match: { _id: channelId } },
    {
      $lookup: {
        from: "video",
        localField: "_id",
        foreignField: "owner",
        as: "channelVideos",
        pipeline: [
          {
            $project: {
              views: 1,
              likes: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        totalSubscribers: { $size: "$subscribers" },
        totalVideos: { $size: "$channelVideos" },
      },
    },
    {
      $facet: {
        viewsAndLikesCount: [
          {
            $group: {
              _id: null,
              totalViews: { $sum: "$channelVideos.views" },
              totalLikes: { $sum: "$channelVideos.likes" },
            },
          },
        ],
        subscribersAndVideosCount: [
          {
            $project: {
              _id: 0,
              totalSubscribers: 1,
              totalVideos: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        combinedData: {
          $mergeObjects: [
            { $arrayElemAt: ["$viewsAndLikesCount", 0] },
            { $arrayElemAt: ["$subscribersAndVideosCount", 0] },
          ],
        },
      },
    },
    {
      $replaceRoot: { newRoot: "$combinedData" },
    },
  ]);

  if (!channel_stats?.length) {
    throw new ApiError(400, "channel not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Channel stats fetched", channel_stats[0]));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const channelId = req?.user._id;
  const { page = 1, limit = 10 } = req.query;
  const videosAggregation = Video.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
  ]);
  const options = { limit: limit, page: page };

  const videos = await Video.aggregatePaginate(videosAggregation, options);
  res.status(200).json(
    new ApiResponse(200, "all videos fetched", {
      videos: videos.docs,
      totalVideos: videos.totalDocs,
      currentPage: videos.page,
      lastPage: videos.totalPages,
    })
  );
});

module.exports = { getChannelStats, getChannelVideos };
