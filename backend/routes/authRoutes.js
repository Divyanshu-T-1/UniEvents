const express = require("express");

const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/authController");

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  handleValidationErrors,
} = require("../middleware/validation");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  registerUser,
);



router.post("/login", loginValidation, handleValidationErrors, loginUser);

router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  handleValidationErrors,
  forgotPassword,
);

router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  handleValidationErrors,
  resetPassword,
);

router.get(
  "/admin-test",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  },
);

module.exports = router;
