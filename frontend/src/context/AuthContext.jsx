import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setUser({
                    token: '',
                    role: res.data.role,
                    username: res.data.username,
                    full_name: res.data.full_name
                });
            } catch (err) {
                setUser(null);
                localStorage.removeItem('user');
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = (token, role, username, full_name) => {
        const userData = { token, role, username, full_name };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const updateUser = (updates) => {
        setUser(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (err) {}
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
