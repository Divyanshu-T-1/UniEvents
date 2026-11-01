const express = require("express");

const {
  getFacultyDashboardStats,
} = require("../controllers/facultyController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Faculty Dashboard Statistics
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("faculty"),
  getFacultyDashboardStats,
);

module.exports = router;
