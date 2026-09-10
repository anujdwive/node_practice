const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token required",
      });
    }
    const decoded = jwt.verify(token, "my_super_secret_key");
    req.user = decoded; //give userId

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or token expire",
    });
  }
};

module.exports = userAuth;
