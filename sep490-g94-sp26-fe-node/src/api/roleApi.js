import axiosClient from './axiosClient';

const roleApi = {
    getAll(params = {}) {
        return axiosClient.get('/api/v1/role/search', { params });
    },

    getDetail(id) {
        return axiosClient.get(`/api/v1/role/${id}`);
    },
};

export default roleApi;
