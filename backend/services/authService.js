const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");

const registerUser = async (userData) => {
  const { name, email, password, rollNo, department, year } = userData;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      rollNo,
      department,
      year,
    });

    return user;
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        const duplicateError = new Error("Email is already registered");

        duplicateError.statusCode = 409;
        throw duplicateError;
      }

      if (error.keyPattern?.rollNo) {
        const duplicateError = new Error("Roll number is already registered");

        duplicateError.statusCode = 409;
        throw duplicateError;
      }
    }

    throw error;
  }
};

const loginUser = async (userData) => {
  try {
    const { email, password } = userData;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return {
      user,
      token,
    };
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Return a generic success response to avoid revealing registered emails
  if (!user) {
    return;
  }

  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token before storing it in the database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;

  // Token expires after 15 minutes
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save();

  // Generate frontend reset URL
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const { sendPasswordResetEmail } = require("./emailService");

  await sendPasswordResetEmail(user.email, resetURL);
};

const resetPassword = async (token, newPassword) => {
  // Hash the token received from the frontend
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with a valid, non-expired reset token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error("Invalid or expired password reset link");
    error.statusCode = 400;
    throw error;
  }

  // Hash the new password
  user.password = await bcrypt.hash(newPassword, 10);

  // Invalidate the reset token after successful use
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
