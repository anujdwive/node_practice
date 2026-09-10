const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // Validation

    const error = {};

    if (!firstName?.trim()) {
      error.firstName = "First Name is required!";
    }

    if (!lastName?.trim()) {
      error.lastName = "Last Name is required!";
    }

    if (!email?.trim()) {
      error.email = "Email is required!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.email = "Please enter valid email!";
    }

    if (!password) {
      error.password = "Password is required!";
    } else if (password.length < 8) {
      error.password = "Password must be 8 char";
    }

    if (Object.keys(error).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation Faild!",
        error,
      });
    }

    // check duplication

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered!",
      });
    }

    // Password hashing

    const hashPassword = await bcrypt.hash(password, 10);

    // User created successfuly

    const user = await User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashPassword,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Signup successfuly!",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!",
      });
    }

    // Check exiting email

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare hash password

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password!",
      });
    }

    // Geneate toke

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "my_super_secret_key",
      {
        expiresIn: "1d",
      },
    );

    // Wrap token into the cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "User login successfuly",
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = router;
