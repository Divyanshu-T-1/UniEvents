const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const bcrypt = require("bcryptjs");

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalEvents,
    pendingEvents,
    approvedEvents,
    rejectedEvents,
    totalRegistrations,
  ] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Event.countDocuments({ status: "pending" }),
    Event.countDocuments({ status: "approved" }),
    Event.countDocuments({ status: "rejected" }),
    Registration.countDocuments({ status: "registered" }),
  ]);

  return {
    totalUsers,
    totalEvents,
    pendingEvents,
    approvedEvents,
    rejectedEvents,
    totalRegistrations,
  };
};

const getAllUsers = async () => {
  const users = await User.find()
    .select("-password -__v")
    .sort({ createdAt: -1 })
    .lean();

  return users;
};

const createFaculty = async (facultyData) => {
  const { name, email, password, department } = facultyData;

  // Check whether email already exists
  const existingUser = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create Faculty account
  const faculty = await User.create({
    name,
    email,
    password: hashedPassword,
    department,
    role: "faculty",
  });

  return {
    id: faculty._id,
    name: faculty.name,
    email: faculty.email,
    department: faculty.department,
    role: faculty.role,
    status: faculty.status,
  };
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  createFaculty,
};
