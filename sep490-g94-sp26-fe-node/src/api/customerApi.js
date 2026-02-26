import axiosClient from './axiosClient';

const customerApi = {
    getAll(params = {}) {
        return axiosClient.get('/api/v1/customer/search', { params });
    },

    getDetail(customerId) {
        return axiosClient.get(`/api/v1/customer/${customerId}`);
    },

    create(data) {
        return axiosClient.post('/api/v1/customer/create', data);
    },

    update(customerId, data) {
        return axiosClient.put('/api/v1/customer/update', data, {
            params: { customerId },
        });
    },

    changeStatus(id) {
        return axiosClient.put(`/api/v1/customer/${id}/change-status`);
    },
};

export default customerApi;
