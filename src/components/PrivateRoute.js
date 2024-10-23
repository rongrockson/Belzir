// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ allowedRoles }) {
    const { user } = useAuth();

    if (!user) {
        // User is not logged in
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // User does not have permission
        return <Navigate to="/unauthorized" replace />;
    }

    // User is authenticated and has permission
    return <Outlet />;
}

export default PrivateRoute;