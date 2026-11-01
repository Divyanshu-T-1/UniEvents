const registrationService = require("../services/registrationService");

const registerForEvent = async (req, res) => {
  try {
    const registration = await registrationService.registerForEvent(
      req.user._id,
      req.params.eventId,
    );

    res.status(201).json({
      success: true,
      message: "Successfully registered for event",
      data: registration,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await registrationService.getMyRegistrations(
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Registrations fetched successfully",
      data: registrations,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const registration = await registrationService.cancelRegistration(
      req.user._id,
      req.params.registrationId,
    );

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      data: registration,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await registrationService.getAllRegistrations();

    res.status(200).json({
      success: true,
      message: "All registrations fetched successfully",
      data: registrations,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Faculty - Get registrations for an event they organized
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await registrationService.getEventRegistrations(
      req.user._id,
      req.params.eventId,
    );

    res.status(200).json({
      success: true,
      message: "Event registrations fetched successfully",
      data: registrations,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Faculty - Get attendance records for an event
const getEventAttendance = async (req, res) => {
  try {
    const attendanceData = await registrationService.getEventAttendance(
      req.user._id,
      req.params.eventId,
    );

    res.status(200).json({
      success: true,
      message: "Event attendance fetched successfully",
      data: attendanceData,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Faculty - Mark attendance for a registered student
const markAttendance = async (req, res) => {
  try {
    const { attendance } = req.body;

    const registration = await registrationService.markAttendance(
      req.user._id,
      req.params.eventId,
      req.params.registrationId,
      attendance,
    );

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      data: registration,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
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