import axiosClient from './axiosClient';

const serviceApi = {
    getAll(params = {}) {
        return axiosClient.get('/api/v1/service/search', { params });
    },

    getDetail(serviceId) {
        return axiosClient.get(`/api/v1/service/${serviceId}`);
    },

    create(data) {
        return axiosClient.post('/api/v1/service/create', data);
    },

    update(serviceId, data) {
        return axiosClient.put('/api/v1/service/update', data, { params: { serviceId } });
    },

    changeStatus(id) {
        return axiosClient.put(`/api/v1/service/${id}/change-status`);
    },
};

export default serviceApi;
