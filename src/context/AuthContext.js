// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

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
            navigate('/');
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
                console.log('Backend response after setting role:', data);

                // Update the user state in the context after setting role
                setUser((prevUser) => ({
                    ...prevUser,
                    role: data.user.role, // Make sure role is updated in the user state
                }));
                localStorage.setItem('user', JSON.stringify({
                    ...user,
                    role: data.user.role
                }));

            } else {
                console.error('Failed to set role:', response.statusText);
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
        if (!user) {
            const params = new URLSearchParams(location.search);
            const userDataParam = params.get('userData');

            if (userDataParam) {
                const parsedUserData = JSON.parse(decodeURIComponent(userDataParam));
                handleAuth(parsedUserData);
                navigate('/', { replace: true });
            } else {
                // Check authentication status only if no user data in URL
                checkAuthStatus();
            }
        }
    }, [user]);


    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, setRole, handleAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}