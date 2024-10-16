const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { verifyJWT } = require("../middlewares/jwt");

router.get("/channel/profile", verifyJWT, userController.getUserChannelProfile);

module.exports = router;
