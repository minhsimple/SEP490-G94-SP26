import axiosClient from './axiosClient';

const leadApi = {
    getAll(params = {}) {
        return axiosClient.get('/api/v1/lead/search', { params });
    },

    getDetail(id) {
        return axiosClient.get(`/api/v1/lead/${id}`);
    },

    create(data) {
        return axiosClient.post('/api/v1/lead/create', data);
    },

    update(leadId, data) {
        return axiosClient.put('/api/v1/lead/update', data, { params: { leadId } });
    },

    changeStatus(id) {
        return axiosClient.patch(`/api/v1/lead/${id}/change-status`);
    },

    assignToSales(leadId, data) {
        return axiosClient.post(`/api/v1/lead/${leadId}/assign-to-sales`, data);
    },
};

export default leadApi;
