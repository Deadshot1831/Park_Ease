import api from './api';

export const createBooking = (data) => api.post('/bookings', data).then((r) => r.data);

export const getMyBookings = (status) =>
  api.get('/bookings/my', { params: status ? { status } : {} }).then((r) => r.data);

export const getIncomingBookings = (status) =>
  api.get('/bookings/incoming', { params: status ? { status } : {} }).then((r) => r.data);

export const getBooking = (id) => api.get(`/bookings/${id}`).then((r) => r.data);

// Downloads the PDF receipt and triggers a browser save
export const downloadInvoice = async (id) => {
  const blob = await api
    .get(`/bookings/${id}/invoice`, { responseType: 'blob' })
    .then((r) => r.data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ParkEase-Receipt-${String(id).slice(-8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const cancelBooking = (id, reason) =>
  api.put(`/bookings/${id}/cancel`, { reason }).then((r) => r.data);

export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status }).then((r) => r.data);

// Payments
export const createOrder = (bookingId) =>
  api.post('/payments/create-order', { bookingId }).then((r) => r.data);

export const verifyPayment = (payload) =>
  api.post('/payments/verify', payload).then((r) => r.data);

export const getPaymentHistory = () => api.get('/payments/history').then((r) => r.data);
