import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function RoleSelection() {
    const { setRole, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role) {
            console.log('Navigating to dashboard based on role in useEffect');
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleRoleSelection = async (role) => {
        try {
            console.log('Role selected:', role);
            await setRole(role);  // This will now correctly update user in AuthContext

            console.log('Role set successfully:', role);

            // Navigate directly to the dashboard once the role is set
            navigate('/dashboard', { replace: true });
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
