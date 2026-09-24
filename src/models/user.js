const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

// 1. Email par unique index
userSchema.index({ email: 1 }, { unique: true });

// 2. Compound index
userSchema.index({
  role: 1,
  createdAt: -1,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
