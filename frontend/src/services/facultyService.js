import api from "./api";

const getFacultyDashboardStats = async () => {
  const response = await api.get("/faculty/dashboard");
  return response.data;
};

const facultyService = {
  getFacultyDashboardStats,
};

export default facultyService;
