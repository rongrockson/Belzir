// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/auth/status`,
                    {
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated && data.user) {
                        setUser(data.user);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

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

    const handleAuth = (userData) => {
        console.log('Received user data:', userData);  // Add this line to debug
        const fullName = `${userData.name.givenName} ${userData.name.familyName}`;
        userData.fullName = fullName;

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        console.log('User from localStorage on component mount:', storedUser);
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


