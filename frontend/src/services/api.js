import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
};

export const parkingSpotAPI = {
  getAllSpots: (filters) => apiClient.get('/parking-spots', { params: filters }),
  getSpotById: (id) => apiClient.get(`/parking-spots/${id}`),
  createSpot: (data) => apiClient.post('/parking-spots', data),
  updateSpot: (id, data) => apiClient.put(`/parking-spots/${id}`, data),
  deleteSpot: (id) => apiClient.delete(`/parking-spots/${id}`),
  addReview: (id, data) => apiClient.post(`/parking-spots/${id}/review`, data),
  seedDemoData: () => apiClient.post('/seed'),
};

export const bookingAPI = {
  createBooking: (data) => apiClient.post('/bookings', data),
  createCheckoutSession: (data) => apiClient.post('/payments/checkout', data),
  confirmCheckoutSession: (sessionId) => apiClient.post('/payments/confirm', { sessionId }),
  getBookings: () => apiClient.get('/bookings'),
  getOwnerBookings: () => apiClient.get('/bookings/owner'),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  updateBooking: (id, data) => apiClient.put(`/bookings/${id}`, data),
  uploadBookingPhotos: (id, data) => apiClient.post(`/bookings/${id}/photos`, data),
  cancelBooking: (id, data) => apiClient.post(`/bookings/${id}/cancel`, data),
};

export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  createAdmin: (data) => apiClient.post('/users/create-admin', data),
};

export default apiClient;
