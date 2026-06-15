import api from './api';

export const getNearbySpots = (lat, lng, radius = 5000, extra = {}) =>
  api.get('/spots/nearby', { params: { lat, lng, radius, ...extra } }).then((r) => r.data);

export const searchSpots = (params) =>
  api.get('/spots/search', { params }).then((r) => r.data);

export const getSpot = (id) => api.get(`/spots/${id}`).then((r) => r.data);

export const createSpot = (data) => api.post('/spots', data).then((r) => r.data);

export const updateSpot = (id, data) => api.put(`/spots/${id}`, data).then((r) => r.data);

export const deleteSpot = (id) => api.delete(`/spots/${id}`).then((r) => r.data);

export const getMySpots = () => api.get('/spots/owner/mine').then((r) => r.data);

export const updateAvailability = (id, availableSpots) =>
  api.put(`/spots/${id}/availability`, { availableSpots }).then((r) => r.data);

export const getReviews = (id, params) =>
  api.get(`/spots/${id}/reviews`, { params }).then((r) => r.data);

export const addReview = (id, data) =>
  api.post(`/spots/${id}/reviews`, data).then((r) => r.data);

export const toggleHelpful = (reviewId) =>
  api.put(`/reviews/${reviewId}/helpful`).then((r) => r.data);

export const uploadImages = (files) => {
  const form = new FormData();
  files.forEach((f) => form.append('images', f));
  return api
    .post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
};
