import api from './api';

const attendanceService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/attendance${params ? `?${params}` : ''}`);
        return response.data;
    },

    getReport: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/attendance/report${params ? `?${params}` : ''}`);
        return response.data;
    },

    submit: async (data) => {
        const response = await api.post('/attendance', data);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/attendance', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/attendance/${id}`, data);
        return response.data;
    }
};

export default attendanceService;
