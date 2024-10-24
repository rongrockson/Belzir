import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Login() {
    const { handleAuth, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(user.role ? '/dashboard' : '/select-role');
        } else {
            const params = new URLSearchParams(location.search);
            const userDataParam = params.get('userData');

            if (userDataParam) {
                try {
                    const parsedUserData = JSON.parse(decodeURIComponent(userDataParam));
                    handleAuth(parsedUserData);
                    navigate('/', { replace: true });
                } catch (error) {
                    console.error('Failed to parse user data:', error);
                }
            }
        }
    }, [user, location, handleAuth, navigate]);

    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-900">Login</h1>
                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    Login with Google
                </button>
            </div>
        </div>
    );
}

export default Login;