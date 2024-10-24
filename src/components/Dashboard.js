
// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userData = queryParams.get('userData');

        // Debugging - log the userData query parameter
        console.log('Query parameter userData:', userData);

        if (userData) {
            try {
                const parsedUserData = JSON.parse(decodeURIComponent(userData));
                console.log('Parsed user data:', parsedUserData); // Log parsed user data
                setUser(parsedUserData);

                if (!parsedUserData?.role) {
                    setShowRoleModal(true);
                } else {
                    const dashboardPath = parsedUserData.role === 'manager' ? '/manager/dashboard' : '/user/dashboard';
                    navigate(dashboardPath, { replace: true });
                }
            } catch (error) {
                console.error('Failed to parse user data:', error);
                navigate('/');
            }
        } else {
            console.error('No userData found in query string.');
            navigate('/');
        }
        setIsLoading(false);
    }, [location, setUser, navigate]);


    const handleRoleSelection = async (role) => {
        try {
            console.log('Role selected:', role);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/set-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                throw new Error(`Failed to set role: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Backend response after setting role:', data);

            // Manually update the user state with the new role
            setUser((prevUser) => ({
                ...prevUser,
                role: data.user.role
            }));

            // Navigate directly based on the role
            console.log('Role set successfully:', role);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Error setting role:', error);
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {showRoleModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-6">Choose Your Role</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => handleRoleSelection('user')}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                User
                            </button>
                            <button
                                onClick={() => handleRoleSelection('manager')}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Manager
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;