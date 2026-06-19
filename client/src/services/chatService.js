import api from './api';

// messages: [{ role: 'user' | 'assistant', content: string }]
export const sendChat = (messages) => api.post('/chat', { messages }).then((r) => r.data);
