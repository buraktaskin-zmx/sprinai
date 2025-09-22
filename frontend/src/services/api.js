import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatService = {
    sendMessage: async (message, username = 'burak') => {
        try {
            const response = await api.post('/user-documents/chat', {
                message: message,
                username: username
            });
            return response.data;
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    },

    uploadDocument: async (file, username = 'burak') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('username', username);

        try {
            const response = await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
};

export default api;