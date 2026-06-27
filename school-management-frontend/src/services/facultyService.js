import api from './api';

const facultyService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/faculty${params ? `?${params}` : ''}`);
        return response.data;
    },

    getMe: async () => {
        const { data } = await api.get('/faculty/me');
        return data;
    },

    getMyStudents: async () => {
        const { data } = await api.get('/faculty/my-students');
        return data;
    },

    create: async (facultyData) => {
        const { data } = await api.post('/faculty', facultyData);
        return data;
    },

    update: async (id, facultyData) => {
        const { data } = await api.patch(`/faculty/${id}`, facultyData);
        return data;
    },

    delete: async (id) => {
        const { data } = await api.delete(`/faculty/${id}`);
        return data;
    },
    approve: async (id) => {
        const { data } = await api.post(`/auth/admin/faculty/${id}/approve`);
        return data;
    },
    reject: async (id) => {
        const { data } = await api.post(`/auth/admin/faculty/${id}/reject`);
        return data;
    }
};

export default facultyService;
