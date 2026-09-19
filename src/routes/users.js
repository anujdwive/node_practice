const express = require("express");
const userAuth = require("../middlewares/auth");
const User = require("../models/user");
const validateObjectId = require("../middlewares/validateObjectId");

const router = express.Router();

router.get("/", userAuth, validateObjectId, async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      result: users,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", userAuth, validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Found!",
      result: user,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", userAuth, validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName } = req.body;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    if (firstName !== undefined) {
      if (!firstName.trim()) {
        return res.status(400).json({
          success: false,
          message: "First name required!",
        });
      }
      user.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      if (!lastName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Last name required!",
        });
      }
      user.lastName = lastName.trim();
    }
    if (
      req.user.role !== "admin" &&
      req.user.userId.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this user",
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfuly!",
      result: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", userAuth, validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.userId.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this user",
      });
    }
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
