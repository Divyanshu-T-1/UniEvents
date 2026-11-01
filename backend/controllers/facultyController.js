
const facultyService = require("../services/facultyService");

const getFacultyDashboardStats = async (req, res) => {
  try {
    const facultyId = req.user._id;

    const stats = await facultyService.getFacultyDashboardStats(facultyId);

    res.status(200).json({
      success: true,
      message: "Faculty dashboard statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Faculty dashboard error:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to fetch faculty dashboard statistics",
    });
  }
};

module.exports = {
  getFacultyDashboardStats,
};