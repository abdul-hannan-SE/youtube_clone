const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const URL = process.env.URL;
const app = express();
const authRoute = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const videoRoutes = require("./routes/video.routes");
const commentsRoutes = require("./routes/comment.routes");
const likeRoutes = require("./routes/like.video.routes");
const subsCriptionRoutes = require("./routes/subscription.routes");
const channelRoutes = require("./routes/channel.routes");
// const morgan = require("morgan");

const serverInstance = require("http").createServer(app);
const socket = require("./socket/socket");

socket.init(serverInstance);

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  "/resources/images/profile_pics",
  express.static(path.join(__dirname, "resources", "images", "profile_pics"))
);

app.use(
  "/resources/videos",
  express.static(path.join(__dirname, "resources", "videos"))
);
app.use("/auth", authRoute);
app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/commet", commentsRoutes);
app.use("/like", likeRoutes);
app.use("/channel", channelRoutes);
app.use("/subscription", subsCriptionRoutes);
app.use((error, req, res, next) => {
  if (!error.statusCode) error.statusCode = 500;
  if (!error.message) error.message = "Something went wrong";
  res.status(error.statusCode).json({ err: error, message: error.message });
});

mongoose.connect(URL).then(() => {
  serverInstance.listen(process.env.PORT);
  console.log("Database connected");
  console.log("App is listening at port 5000");
});
