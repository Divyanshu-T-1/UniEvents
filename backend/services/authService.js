const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// REGISTER USER
const registerUser = async (userData) => {
  try {
    const { name, email, password, role, rollNo, department, year } = userData;

    const existingUser = await User.findOne({
      $or: [{ email }, { rollNo }],
    });

    if (existingUser) {
      const error = new Error(
        existingUser.email === email
          ? "Email already registered"
          : "Roll number already registered",
      );

      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      rollNo,
      department,
      year,
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// LOGIN USER
const loginUser = async (userData) => {
  try {
    const { email, password } = userData;

    const user = await User.findOne({ email });


    // VERIFY PASSWORD
    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // GENERATE JWT TOKEN
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

// FORGOT PASSWORD
const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Return reset token for the email-sending logic.
    return resetToken;
  } catch (error) {
    throw error;
  }
};

// RESET PASSWORD
const resetPassword = async (token, newPassword) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      const error = new Error("Invalid or expired reset token");
      error.statusCode = 400;
      throw error;
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
  } catch (error) {
    throw error;
  }
};

// EXPORT SERVICES
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
