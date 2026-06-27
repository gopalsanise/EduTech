import api from './api';

const resultService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/results${params ? `?${params}` : ''}`);
        return response.data;
    },

    getStudentResults: async (studentId) => {
        const response = await api.get(`/results/student/${studentId}`);
        return response.data;
    },

    submit: async (data) => {
        const response = await api.post('/results', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/results/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/results/${id}`);
        return response.data;
    },

    getAnalytics: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/results/analytics${params ? `?${params}` : ''}`);
        return response.data;
    }
};

export default resultService;
