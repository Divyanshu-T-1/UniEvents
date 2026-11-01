const express = require("express");

const {
  getDashboardStats,
  getAllUsers,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin dashboard statistics
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("admin"),
  getDashboardStats,
);

// Get all university users
router.get("/users", authMiddleware, authorizeRoles("admin"), getAllUsers);

module.exports = router;
