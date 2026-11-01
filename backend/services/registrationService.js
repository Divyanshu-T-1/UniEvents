const Registration = require("../models/Registration");
const Event = require("../models/Event");

const registerForEvent = async (studentId, eventId) => {
  // 1. Check if event exists
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Check if event is approved
  if (event.status !== "approved") {
    const error = new Error("This event is not available for registration");
    error.statusCode = 400;
    throw error;
  }

  // 3. Find any existing registration, regardless of status
  const existingRegistration = await Registration.findOne({
    student: studentId,
    event: eventId,
  });

  if (existingRegistration) {
    if (existingRegistration.status === "registered") {
      const error = new Error("You are already registered for this event");
      error.statusCode = 409;
      throw error;
    }

    // Reactivate a previously cancelled registration
    if (existingRegistration.status === "cancelled") {
      const registrationCount = await Registration.countDocuments({
        event: eventId,
        status: "registered",
      });

      if (registrationCount >= event.capacity) {
        const error = new Error("Event is full");
        error.statusCode = 400;
        throw error;
      }

      existingRegistration.status = "registered";
      await existingRegistration.save();

      return existingRegistration;
    }

    const error = new Error("This registration cannot be reactivated");
    error.statusCode = 409;
    throw error;
  }

  // 4. Check event capacity
  const registrationCount = await Registration.countDocuments({
    event: eventId,
    status: "registered",
  });

  if (registrationCount >= event.capacity) {
    const error = new Error("Event is full");
    error.statusCode = 400;
    throw error;
  }

  // 5. Create a new registration
  try {
    return await Registration.create({
      student: studentId,
      event: eventId,
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error(
        "You are already registered for this event",
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};

const getMyRegistrations = async (studentId) => {
  const registrations = await Registration.find({
    student: studentId,
    status: "registered",
  })
    .populate("event")
    .sort({ createdAt: -1 });

  return registrations;
};

const cancelRegistration = async (studentId, registrationId) => {
  const registration = await Registration.findOne({
    _id: registrationId,
    student: studentId,
    status: "registered",
  });

  if (!registration) {
    const error = new Error("Registration not found");
    error.statusCode = 404;
    throw error;
  }

  registration.status = "cancelled";
  await registration.save();

  return registration;
};

const getAllRegistrations = async () => {
  const registrations = await Registration.find({
    status: "registered",
  })
    .populate("student", "name email rollNo department year")
    .populate("event", "title date startTime endTime venue category");

  return registrations;
};

// Faculty - Get registrations for an event they organized
const getEventRegistrations = async (facultyId, eventId) => {
  // 1. Verify that the event exists and belongs to this faculty member
  const event = await Event.findOne({
    _id: eventId,
    organizer: facultyId,
  });

  if (!event) {
    const error = new Error(
      "Event not found or you are not authorized to view its registrations",
    );
    error.statusCode = 404;
    throw error;
  }

  // 2. Fetch registrations and student details
  const registrations = await Registration.find({
    event: eventId,
    status: "registered",
  })
    .populate("student", "name email rollNo department year")
    .sort({ createdAt: -1 });

  return registrations;
};

// Faculty - Get attendance records for an event they organized
const getEventAttendance = async (facultyId, eventId) => {
  // 1. Verify event ownership
  const event = await Event.findOne({
    _id: eventId,
    organizer: facultyId,
  });

  if (!event) {
    const error = new Error(
      "Event not found or you are not authorized to manage its attendance",
    );
    error.statusCode = 404;
    throw error;
  }

  // 2. Fetch active registrations and student details
  const registrations = await Registration.find({
    event: eventId,
    status: "registered",
  })
    .populate("student", "name email rollNo department year")
    .sort({ createdAt: -1 });

  // 3. Calculate attendance statistics
  const totalRegistered = registrations.length;

  const present = registrations.filter(
    (registration) => registration.attendance === "present",
  ).length;

  const absent = registrations.filter(
    (registration) => registration.attendance === "absent",
  ).length;

  const notMarked = totalRegistered - present - absent;

  const attendancePercentage =
    totalRegistered > 0
      ? Number(((present / totalRegistered) * 100).toFixed(2))
      : 0;

  return {
    event: {
      _id: event._id,
      title: event.title,
      date: event.date,
      status: event.status,
    },
    statistics: {
      totalRegistered,
      present,
      absent,
      notMarked,
      attendancePercentage,
    },
    registrations,
  };
};

// Faculty - Mark attendance for a registered student
const markAttendance = async (facultyId, eventId, registrationId, attendance) => {
  // 1. Validate attendance value
  if (!["present", "absent"].includes(attendance)) {
    const error = new Error(
      "Attendance must be either present or absent",
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify event ownership
  const event = await Event.findOne({
    _id: eventId,
    organizer: facultyId,
  });

  if (!event) {
    const error = new Error(
      "Event not found or you are not authorized to manage its attendance",
    );
    error.statusCode = 404;
    throw error;
  }

  // 3. Find an active registration belonging to this event
  const registration = await Registration.findOne({
    _id: registrationId,
    event: eventId,
    status: "registered",
  });

  if (!registration) {
    const error = new Error(
      "Active registration not found for this event",
    );
    error.statusCode = 404;
    throw error;
  }

  // 4. Save attendance
  registration.attendance = attendance;
  await registration.save();

  return registration;
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getAllRegistrations,
  getEventRegistrations,
  getEventAttendance,
  markAttendance,
};