import api from './api';

export const submitContact = (data) => api.post('/support', data).then((r) => r.data);
