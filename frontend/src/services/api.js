import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me')
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getAvailability: () => api.get('/users/me/availability'),
  updateAvailability: (data) => api.put('/users/me/availability', data)
};

// Goals API
export const goalsAPI = {
  getAll: (params) => api.get('/goals', { params }),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  prioritize: (id, data) => api.post(`/goals/${id}/prioritize`, data)
};

// Work Units API
export const workUnitsAPI = {
  getAll: (params) => api.get('/work-units', { params }),
  create: (data) => api.post('/work-units', data),
  updateStatus: (id, status) => api.put(`/work-units/${id}/status`, { status }),
  reschedule: (id, data) => api.put(`/work-units/${id}/reschedule`, data),
  delete: (id) => api.delete(`/work-units/${id}`)
};

// Scheduler API
export const schedulerAPI = {
  generate: (date) => api.post('/scheduler/generate', null, { params: { date } }),
  regenerate: () => api.post('/scheduler/regenerate'),
  getCalendar: (rangeStart, rangeEnd) => api.get('/scheduler/calendar', { 
    params: { rangeStart, rangeEnd } 
  }),
  importEvents: (events) => api.post('/scheduler/calendar/import', { events })
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  create: (data) => api.post('/notifications', data),
  test: (type) => api.post('/notifications/test', { type })
};

// Mentor API
export const mentorAPI = {
  getStudents: () => api.get('/mentor/users'),
  getStudentProgress: (userId) => api.get(`/mentor/users/${userId}/progress`)
};

export default api;
