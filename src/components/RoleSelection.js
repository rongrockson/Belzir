
// src/components/RoleSelection.js
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function RoleSelection() {
    const { setRole, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleRoleSelection = async (role) => {
        try {
            console.log('Role selected:', role);
            await setRole(role);
            console.log('navigate to dashboard');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error setting role:', error);
        }
    };

    return (
        <div className="role-selection-popup">
            <h2>Please select your role:</h2>
            <button onClick={() => handleRoleSelection('user')}>User</button>
            <button onClick={() => handleRoleSelection('manager')}>Manager</button>
        </div>
    );
}

export default RoleSelection;
