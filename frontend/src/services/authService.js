import api from "./api";

const authService = {
  // Register a new student
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Log in an existing user
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
};

export default authService;
