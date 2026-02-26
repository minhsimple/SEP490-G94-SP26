import axiosClient from './axiosClient';

const hallApi = {
    getAll(params = {}) {
        return axiosClient.get('/api/v1/hall/search', { params });
    },

    getDetail(id) {
        return axiosClient.get(`/api/v1/hall/${id}`);
    },

    create(data) {
        return axiosClient.post('/api/v1/hall/create', data);
    },

    update(hallId, data) {
        return axiosClient.put('/api/v1/hall/update', data, { params: { hallId } });
    },

    changeStatus(id) {
        return axiosClient.patch(`/api/v1/hall/${id}/change-status`);
    },
};

export default hallApi;
