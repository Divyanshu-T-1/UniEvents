const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    resetPasswordToken: {
      type: String,
      default: undefined,

    },

    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student"
    },

    rollNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    department: {
      type: String,
      trim: true

    },

    year: {
      type: Number
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    }
  },
   {
    timestamps: true
   }
);

const User = mongoose.model("User", userSchema);

module.exports = User;