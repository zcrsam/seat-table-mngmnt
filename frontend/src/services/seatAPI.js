import api from './api.js';

export const seatAPI = {
  // Get all seats
  getAll: () => api.get('/seats'),

  // Get single seat
  getById: (id) => api.get(`/seats/${id}`),

  // Create new seat
  create: (seatData) => api.post('/seats', seatData),

  // Update seat
  update: (id, seatData) => api.put(`/seats/${id}`, seatData),

  // Delete seat
  delete: (id) => api.delete(`/seats/${id}`),

  // Reserve seat
  reserve: (id) => api.patch(`/seats/${id}/reserve`),

  // Release seat
  release: (id) => api.patch(`/seats/${id}/release`),
};
