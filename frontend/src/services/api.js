import axios from "axios";

const API_URL = "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
};

// Donation API
export const donationAPI = {
  create: (data) => api.post("/donations", data),
  getMyDonations: () => api.get("/donations/my-donations"),
  getById: (id) => api.get(`/donations/${id}`),
  update: (id, data) => api.put(`/donations/${id}`, data),
  delete: (id) => api.delete(`/donations/${id}`),
};

// Volunteer API
export const volunteerAPI = {
  getAvailableTasks: () => api.get("/volunteers/available-tasks"),
  acceptTask: (donationId) => api.post(`/volunteers/accept/${donationId}`),
  getMyTasks: () => api.get("/volunteers/my-tasks"),
  updateTaskStatus: (donationId, status) =>
    api.put(`/volunteers/update-status/${donationId}`, { status }),
  getLeaderboard: () => api.get("/volunteers/leaderboard"),
  updateLocation: (donationId, latitude, longitude) =>
    api.put(`/volunteers/update-location/${donationId}`, {
      latitude,
      longitude,
    }),
  getTrackingInfo: (donationId) => api.get(`/volunteers/track/${donationId}`),
  getDonorInfo: (donationId) => api.get(`/volunteers/donor-info/${donationId}`),
};

// Admin API
export const adminAPI = {
  getAllDonations: () => api.get("/admin/donations"),
  getAllVolunteers: () => api.get("/admin/volunteers"),
  getAllDonors: () => api.get("/admin/donors"),
  getStats: () => api.get("/admin/stats"),
};

// Message API
export const messageAPI = {
  sendMessage: (recipientId, content) =>
    api.post("/messages", { recipientId, content }),
  getMessages: () => api.get("/messages"),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  getUnreadCount: () => api.get("/messages/unread-count"),
};

// Organization API
export const organizationAPI = {
  getCampaigns: () => api.get("/organization/campaigns"),
  createCampaign: (data) => api.post("/organization/campaigns", data),
  updateCampaign: (id, data) => api.put(`/organization/campaigns/${id}`, data),
  getVolunteers: () => api.get("/organization/volunteers"),
  getDonations: () => api.get("/organization/donations"),
  acceptDonation: (donationId) =>
    api.post(`/organization/donations/${donationId}/accept`),
  getStats: () => api.get("/organization/stats"),
};

export default api;
