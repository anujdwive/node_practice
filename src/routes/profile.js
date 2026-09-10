const express = require("express");
const userAuth = require("../middlewares/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/", userAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
