const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;
const Like = require("../models/like.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.query;
  const userId = req?.user._id;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(
      400,
      "Video id is not correct it must be of type ObjectId"
    );
  }
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    // If the subscription exists, unsubscribe (delete the subscription)
    await existingLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, "toggled like"));
  } else {
    // If the subscription doesn't exist, create a new one (subscribe)
    const newLike = new Like({ video: videoId, likedBy: userId });
    await newLike.save();
    return res.status(201).json(new ApiResponse(201, "Liked added to video"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.query;
  //TODO: toggle like on comment

  const userId = req?.user._id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(
      400,
      "Video id is not correct it must be of type ObjectId"
    );
  }
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    // If the subscription exists, unsubscribe (delete the subscription)
    await existingLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, "toggled like"));
  } else {
    // If the subscription doesn't exist, create a new one (subscribe)
    const newLike = new Like({ video: videoId, likedBy: userId });
    await newLike.save();
    return res.status(201).json(new ApiResponse(201, "Liked added to video"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { videoId, limit = 10, page = 1 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video id required of type ObjectId");
  }
  const likeVideosAggregate = Like.aggregate([
    {
      $match: {
        video: videoId,
      },
    },
    {
      $lookup: {
        from: "video",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
        pipeline: [
          {
            $project: {
              videoFile: 0,
            },
          },
        ],
      },
    },
  ]);
  const likedVideos = Like.aggregatePaginate(likeVideosAggregate, {
    limit: limit,
    page: page,
  });
});

module.exports = { toggleCommentLike, toggleVideoLike, getLikedVideos };
