import api from './api';

const assignmentService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/assignments${params ? `?${params}` : ''}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/assignments', data);
        return response.data;
    },

    submit: async (id, data) => {
        const response = await api.post(`/assignments/${id}/submit`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/assignments/${id}`);
        return response.data;
    }
};

export default assignmentService;
