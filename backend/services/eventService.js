const Event = require("../models/Event");

const createEvent = async (eventData) => {
  try {
    const event = await Event.create(eventData);

    return event;
  } catch (error) {
    throw error;
  }
};

const getAllEvents = async () => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email role")
      .sort({ date: 1 });

    return events;
  } catch (error) {
    throw error;
  }
};

const getEventById = async (eventId) => {
  try {
    const event = await Event.findById(eventId).populate(
      "organizer",
      "name email role",
    );

    if (!event) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    return event;
  } catch (error) {
    throw error;
  }
};

const updateEvent = async (eventId, updateData, user) => {
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    // Only the organizer or admin can update
    if (
      user.role !== "admin" &&
      event.organizer.toString() !== user._id.toString()
    ) {
      const error = new Error("You are not authorized to update this event");
      error.statusCode = 403;
      throw error;
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true,
    }).populate("organizer", "name email role");

    return updatedEvent;
  } catch (error) {
    throw error;
  }
};

const deleteEvent = async (eventId, user) => {
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    // Only the organizer or admin can delete
    if (
      user.role !== "admin" &&
      event.organizer.toString() !== user._id.toString()
    ) {
      const error = new Error("You are not authorized to delete this event");
      error.statusCode = 403;
      throw error;
    }

    await Event.findByIdAndDelete(eventId);

    return event;
  } catch (error) {
    throw error;
  }
};

const approveEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    event.status = "approved";

    await event.save();

    return event;
  } catch (error) {
    throw error;
  }
};

const rejectEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    event.status = "rejected";

    await event.save();

    return event;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent
};
