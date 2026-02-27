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

    // Review APIs - Update endpoints when backend is ready
    getReviews(hallId) {
        return axiosClient.get(`/api/v1/hall/${hallId}/reviews`);
    },

    addReview(hallId, data) {
        return axiosClient.post(`/api/v1/hall/${hallId}/reviews`, data);
    },

    deleteReview(hallId, reviewId) {
        return axiosClient.delete(`/api/v1/hall/${hallId}/reviews/${reviewId}`);
    },

    // Booking APIs - Update endpoints when backend is ready
    getBookings(hallId, params = {}) {
        return axiosClient.get(`/api/v1/hall/${hallId}/bookings`, { params });
    },

    addBooking(hallId, data) {
        return axiosClient.post(`/api/v1/hall/${hallId}/bookings`, data);
    },

    updateBooking(hallId, bookingId, data) {
        return axiosClient.put(`/api/v1/hall/${hallId}/bookings/${bookingId}`, data);
    },

    confirmBooking(hallId, bookingId) {
        return axiosClient.patch(`/api/v1/hall/${hallId}/bookings/${bookingId}/confirm`);
    },

    cancelBooking(hallId, bookingId) {
        return axiosClient.patch(`/api/v1/hall/${hallId}/bookings/${bookingId}/cancel`);
    },
};

export default hallApi;
