// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ allowedRoles }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        console.log('No user found, redirecting to login.');
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!user.role) {
        console.log('User found but no role set, redirecting to role selection.');
        return <Navigate to="/select-role" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        console.log(`Unauthorized access: user role ${user.role} not allowed.`);
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    console.log('User authorized:', user);


    return <Outlet />;
}

export default PrivateRoute;