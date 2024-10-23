// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    // Function to check authentication status
    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/status`, {
                credentials: 'include', // Important for sending cookies
            });

            if (response.ok) {
                const data = await response.json();
                if (data.authenticated && data.user) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    // Function to log in the user
    const login = () => {
        window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
    };

    // Function to log out the user
    const logout = async () => {
        try {
            await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            setUser(null);
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const setRole = async (role) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/set-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Role set successfully', data);
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                console.error('Failed to set role');
            }
        } catch (error) {
            console.error('Error setting role:', error);
        }
    };

    // Function to handle authentication after login
    const handleAuth = (userData) => {
        const fullName = `${userData.name.givenName} ${userData.name.familyName}`;
        userData.fullName = fullName;

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, setRole, handleAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
