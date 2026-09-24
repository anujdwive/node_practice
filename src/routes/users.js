const express = require("express");
const userAuth = require("../middlewares/auth");
const User = require("../models/user");
const validateObjectId = require("../middlewares/validateObjectId");

const router = express.Router();

router.get("/", userAuth, async (req, res, next) => {
  try {
    const { search = "", role, sort = "createdAt", order = "desc" } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // 1. Pagination validation
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    // 2. Sort validation
    const allowedSortFields = ["createdAt", "firstName", "lastName"];

    if (!allowedSortFields.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort field",
      });
    }

    const sortOrder = order === "desc" ? -1 : 1;

    // 3. Search filter
    const filter = {};

    if (search.trim()) {
      filter.$or = [
        {
          firstName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter
    if (role) {
      filter.role = role;
    }

    // 4. Calculate skip
    const skip = (page - 1) * limit;

    // 5. Get users
    const users = await User.find(filter)
      .select("-password")
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit);

    // 6. Total matching users
    const total = await User.countDocuments(filter);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
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
