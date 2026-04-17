import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = (token, role, username, full_name) => {
        setUser({ token, role, username, full_name });
    };

    const updateUser = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (err) {
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
