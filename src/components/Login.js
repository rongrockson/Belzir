// src/components/Login.js
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Login() {
    const { handleAuth, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (!user.role) {
                navigate('/select-role');
            } else {
                navigate('/dashboard');
            }
        } else {
            // Check if redirected back from the backend with user data
            const params = new URLSearchParams(location.search);
            const userDataParam = params.get('userData');

            if (userDataParam) {
                const parsedUserData = JSON.parse(decodeURIComponent(userDataParam));
                handleAuth(parsedUserData);
                navigate('/', { replace: true });
            }
        }
    }, [user, location, handleAuth, navigate]);

    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
    };

    return (
        <div>
            <h1>Login Page</h1>
            <button onClick={handleLogin}>Login with Google</button>
        </div>
    );
}

export default Login;
