import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        const full_name = localStorage.getItem('full_name');

        if (token && role) {
            setUser({ token, role, username, full_name });
        }
        setLoading(false);
    }, []);

    const login = (token, role, username, full_name) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('username', username);
        localStorage.setItem('full_name', full_name);
        setUser({ token, role, username, full_name });
    };

    const updateUser = (updates) => {
        if (updates.full_name) {
            localStorage.setItem('full_name', updates.full_name);
        }
        if (updates.username) {
            localStorage.setItem('username', updates.username);
        }
        setUser(prev => ({ ...prev, ...updates }));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('full_name');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
