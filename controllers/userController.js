// const { validationResult } = require("express-validator");
// const { clearFile } = require("../utils/common");
// const Post = require("../models/post.model");
// const fs = require("fs");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const User = require("../models/user.model");

// const SocketManager = require("../socket/socket");

// exports.uploadPost = asyncHandler(
//   async (req, res, next) => {
//     const socket = SocketManager.getSocket();
//     const io = SocketManager.getIO();

//     const userId = req.body.userId;
//     const currentUser = SocketManager.users.find(
//       (user) => user.userId === userId
//     );
//     const err = validationResult(req);
//     if (!err.isEmpty()) {
//       throw new ApiError(422, `${err.message}`);
//     }

//     if (!req.file) {
//       throw new ApiError(400, "Video file not attached")
//     }
//     const fileSize = req.file.size;
//     let uploadedSize = 0;
//     const readStream = fs.createReadStream(req.file.path);
//     const destinationPath = path.join(
//       __dirname,
//       "..",
//       "resources",
//       "videos",
//       req.file.filename
//     );
//     const writeStream = fs.createWriteStream(destinationPath);
//     readStream.on("data", (chunk) => {
//       uploadedSize += chunk.length;
//       const progress = Math.round((uploadedSize / fileSize) * 100);
//       io.to(currentUser.socketId).emit("uploadProgress", { progress });
//     });
//     readStream.on("end", async () => {
//       const { creator, description } = req.body;
//       const newPost = new Post({
//         creator: creator,
//         description: description,
//         videoUrl: "http://localhost:3000/resources/videos/" + req.file.filename,
//       });

//       await newPost.save();
//       io.emit("uploadProgress", { progress: 100 });

//       res.status(200).json(new ApiResponse(201, "Post created", newPost));
//     });
//     readStream.pipe(writeStream);
//     readStream.on("error", (err) => {
//       throw new ApiError(500, "Error while creating post please try again");
//     });
//   }
// )

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const username = req.query.username;
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

module.exports = { getUserChannelProfile };
