// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showRoleModal, setShowRoleModal] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userData = queryParams.get('userData');

        if (userData) {
            try {
                const parsedUserData = JSON.parse(decodeURIComponent(userData));
                setUser(parsedUserData);

                if (!parsedUserData?.role || parsedUserData.role === '') {
                    setShowRoleModal(true);
                } else {
                    navigate(parsedUserData.role === 'manager' ? '/manager/dashboard' : '/user/dashboard', { replace: true });
                }
            } catch (error) {
                console.error('Failed to parse user data:', error);
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [location, setUser, navigate]);

    const handleRoleSelection = async (role) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/set-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                throw new Error('Failed to set role');
            }

            const data = await response.json();
            setUser({ ...user, role: data.user.role });
            setShowRoleModal(false);
            navigate(role === 'manager' ? '/manager/dashboard' : '/user/dashboard');
        } catch (error) {
            console.error('Error setting role:', error);
        }
    };

    return (
        <div>
            {showRoleModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl mb-4">Choose Your Role</h2>
                        <button
                            onClick={() => handleRoleSelection('user')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg m-2"
                        >
                            User
                        </button>
                        <button
                            onClick={() => handleRoleSelection('manager')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg m-2"
                        >
                            Manager
                        </button>
                    </div>
                </div>
            )}

            {!showRoleModal && <div>Loading Dashboard...</div>}
        </div>
    );
}

export default Dashboard;