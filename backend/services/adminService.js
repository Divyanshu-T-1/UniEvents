const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

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

module.exports = {
  getDashboardStats,
  getAllUsers,
};
