import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }
            const res = await authApi.getCurrentUser();
            const userData = res.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const login = async (credentials) => {
        const res = await authApi.login(credentials);
        const { accessToken, refreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Try to fetch full user profile, fallback to basic info
        try {
            const meRes = await authApi.getCurrentUser();
            const userData = meRes.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch {
            // /api/v1/auth/me failed — use basic info so user is not null
            const fallbackUser = { email: credentials.email, fullName: credentials.email };
            setUser(fallbackUser);
            localStorage.setItem('user', JSON.stringify(fallbackUser));
        }

        setLoading(false);
        message.success('Đăng nhập thành công!');
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // ignore logout API errors
        }
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        message.info('Đã đăng xuất');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default AuthContext;
