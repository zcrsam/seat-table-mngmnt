import api from './api.js';

export const venueAPI = {
  // Get all venues
  getAll: () => api.get('/venues'),

  // Get single venue with seats and reservations
  getById: (id) => api.get(`/venues/${id}`),

  // Create new venue
  create: (venueData) => api.post('/venues', venueData),

  // Update venue
  update: (id, venueData) => api.put(`/venues/${id}`, venueData),

  // Delete venue
  delete: (id) => api.delete(`/venues/${id}`),

  // Get venue seats
  getSeats: (venueId) => api.get(`/venues/${venueId}/seats`),

  // Get venue reservations
  getReservations: (venueId) => api.get(`/venues/${venueId}/reservations`),
};
