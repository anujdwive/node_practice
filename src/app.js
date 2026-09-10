const express = require("express");
const connectDB = require("./config/database");
const userAuth = require("./middlewares/auth");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const usersRoutes = require("./routes/users");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

// Auth
app.use("/auth", authRoutes);

// Profile
app.use("/profile", profileRoutes);

// Users
app.use("/users", usersRoutes);

app.use("/", userAuth, (req, res) => {
  res.send("This is an home page");
});

app.use((err, req, res, next) => {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(7777, () => {
      console.log("server listing on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected");
  });
