import axiosClient from './axiosClient';

const locationApi = {
    getAll(params = {}) {
        return axiosClient.get('/api/v1/location/search', { params });
    },

    getDetail(id) {
        return axiosClient.get(`/api/v1/location/${id}`);
    },

    create(data) {
        return axiosClient.post('/api/v1/location/create', data);
    },

    update(locationId, data) {
        return axiosClient.put('/api/v1/location/update', data, { params: { locationId } });
    },

    changeStatus(id) {
        return axiosClient.patch(`/api/v1/location/${id}/change-status`);
    },
};

export default locationApi;
