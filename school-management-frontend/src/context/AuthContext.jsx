import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (token && userStr) {
                    const storedUser = JSON.parse(userStr);
                    // Normalize backend 'teacher' to frontend 'staff'
                    if (storedUser.role === 'teacher') storedUser.role = 'staff';
                    setUser(storedUser);
                }
            } catch (err) {
                console.error('Failed to initialize auth from storage:', err);
                // Clear corrupted data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email, password, enrollmentNumber = null, portal = null) => {
        const { data } = await api.post('/auth/login', { email, password, enrollmentNumber, portal });
        const userToStore = data.user;
        if (userToStore.role === 'teacher') userToStore.role = 'staff';
        setUser(userToStore);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userToStore));
        return { success: true };
    };


    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        const userToStore = data.user;
        if (userToStore.role === 'teacher') userToStore.role = 'staff';
        setUser(userToStore);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userToStore));
    };

    const signup = async (userData) => {
        const { data } = await api.post('/auth/signup', userData);
        const userToStore = data.user;
        if (userToStore.role === 'teacher') userToStore.role = 'staff';
        setUser(userToStore);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userToStore));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, signup, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
