const mongoose = require("mongoose");
const Video = require("../models/video.model.js"); // Remove curly braces for default exports
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const channelId = req?.user._id;
  const channel_stats = await Video.aggregate([
    { $match: { owner: new mongoose.Schema.Types.ObjectId(channelId) } },
    {
      $facet: {
        videos: [
          {
            $project: {
              title: 1,
              views: 1,
              isPublished: 1,
              owner: 1,
            },
          },
        ],
        totalVideos: [
          { $count: "totalCount" }, // Count total number of videos after matching
        ],
        totalViews: [
          {
            $group: {
              _id: null,
              totalViews: { $sum: "$views" },
              totalLikes: { $sum: "$likes" }, // Sum views for all matched videos
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "owner",
        foreignField: "channle",
        as: "subscribers",
      },
    },
    {
      $project: {
        subscribersCount: { $size: "$subscribers" },
        totalViews: { $arrayElemAt: ["$totalViews.totalViews", 0] },
        videoCount: { $arrayElemAt: ["$totalVideos.totalCount", 0] },
        totalLikes: { $arrayElemAt: ["$totalViews.totalLikes", 0] },
      },
    },
  ]);

  if (!channel_stats?.lenght) {
    throw new ApiError(404, "Could not found channel");
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
        channel: new mongoose.Schema.Types.ObjectId(channelId),
      },
    },
  ]);
  const options = { limit: limit, page: page };
  const videos = await Video.aggregatePaginate(videosAggregation, options);
  if (!videos?.length) {
    throw new ApiError(404, "No video found");
  }
  res.status(200).json(new ApiResponse(200, "all videos fetched", videos));
});

module.exports = { getChannelStats, getChannelVideos };
