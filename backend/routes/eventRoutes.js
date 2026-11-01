const express = require("express");

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent
} = require("../controllers/eventController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Create Event
router.post(
  "/",
  authMiddleware,
  authorizeRoles("faculty", "admin"),
  createEvent,
);

// Get All Events
router.get("/", getAllEvents);

// Get Single Event
router.get("/:id", getEventById);

// Update Event
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("faculty", "admin"),
  updateEvent,
);

// Delete Event
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("faculty", "admin"),
  deleteEvent,
);

router.patch(
  "/:id/approve",
  authMiddleware,
  authorizeRoles("admin"),
  approveEvent
);

router.patch(
  "/:id/reject",
  authMiddleware,
  authorizeRoles("admin"),
  rejectEvent,
);

module.exports = router;
