import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Worker API calls
export const workerAPI = {
  getWorkers: (params) => api.get('/workers', { params }),
  searchWorkers: (params) => api.get('/workers/search', { params }),
  getWorkerById: (id) => api.get(`/workers/${id}`),
  createWorker: (data) => api.post('/workers', data),
  updateWorker: (id, data) => api.put(`/workers/${id}`, data),
  getContractorWorkers: () => api.get('/workers/contractor/list')
};

// Booking API calls
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  createPaymentOrder: (data) => api.post('/bookings/payment/create-order', data),
  verifyPayment: (data) => api.post('/bookings/payment/verify', data)
};

// Review API calls
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getWorkerReviews: (workerId) => api.get(`/reviews/worker/${workerId}`),
  getBookingReview: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
  deleteReview: (id) => api.delete(`/reviews/${id}`)
};

export default api;
