const express = require("express");

const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getAllRegistrations,
  getEventRegistrations,
  getEventAttendance,
  markAttendance,
} = require("../controllers/registrationController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin - Get all registrations
router.get("/", authMiddleware, authorizeRoles("admin"), getAllRegistrations);

// Student - Register for an event
router.post(
  "/:eventId",
  authMiddleware,
  authorizeRoles("student"),
  registerForEvent,
);

// Student - Get my registrations
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("student"),
  getMyRegistrations,
);

// Student - Cancel registration
router.delete(
  "/:registrationId",
  authMiddleware,
  authorizeRoles("student"),
  cancelRegistration,
);

// Faculty - Get registrations for an event
router.get(
  "/event/:eventId",
  authMiddleware,
  authorizeRoles("faculty"),
  getEventRegistrations,
);

// Faculty - Get attendance records and statistics for an event
router.get(
  "/event/:eventId/attendance",
  authMiddleware,
  authorizeRoles("faculty"),
  getEventAttendance,
);

// Faculty - Mark attendance for a registered student
router.patch(
  "/event/:eventId/attendance/:registrationId",
  authMiddleware,
  authorizeRoles("faculty"),
  markAttendance,
);

module.exports = router;
