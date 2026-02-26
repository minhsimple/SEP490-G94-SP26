import axiosClient from './axiosClient';

const authApi = {
    login(data) {
        return axiosClient.post('/api/v1/auth/login', data);
    },

    register(data) {
        return axiosClient.post('/api/v1/auth/register', data);
    },

    getCurrentUser() {
        return axiosClient.get('/api/v1/auth/me');
    },

    refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        return axiosClient.post('/api/v1/auth/refresh', null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
        });
    },

    logout() {
        const refreshToken = localStorage.getItem('refreshToken');
        return axiosClient.post('/api/v1/auth/logout', null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
        });
    },

    logoutAllDevices() {
        return axiosClient.post('/api/v1/auth/logout-all');
    },
};

export default authApi;
