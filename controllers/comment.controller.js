const mongoose = require("mongoose");
const Comment = require("../models/comment.models.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const options = { page: page, limit: limit };
  const commentAggregate = Comment.aggregate([
    { $match: { video: new mongoose.Schema.Types.ObjectId(videoId) } },
  ]);

  const comments = await Comment.aggregatePaginate(commentAggregate, options);
  if (!comments?.length) {
    throw new ApiError(404, "No comment found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "All comments fetched", comments[0]));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content, videoId } = req.body;
  const userId = req?.user._id;
  const comment = new Comment({
    content: content,
    video: videoId,
    owner: userId,
  });
  comment.save();
  res.status(201).json(new ApiResponse(201, "Comment added success", comment));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId, content } = req.body;
  const comment = await Comment.findByIdAndUpdate(commentId, {
    content: content,
  });
  if (!comment) {
    throw new ApiError(400, "Comment id inccorect");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Comment updated success", comment));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.body;
  const result = await Comment.findByIdAndDelete(commentId);
  if (!result) {
    throw new ApiError(400, "Comment could not be deleted");
  }
  res.status(200).json(true);
});

module.exports = {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
};
