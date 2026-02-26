import axiosClient from './axiosClient';

const userApi = {
    getAll(params = {}) {
        return axiosClient.get('/api/v1/user/search', { params });
    },

    create(data) {
        return axiosClient.post('/api/v1/user/create', data);
    },

    update(id, data) {
        return axiosClient.put(`/api/v1/user/${id}/update`, data);
    },

    changeStatus(id) {
        return axiosClient.patch(`/api/v1/user/${id}/change-status`);
    },
};

export default userApi;
