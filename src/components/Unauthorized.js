// src/components/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';

function Unauthorized() {
    return (
        <div>
            <h1>Unauthorized Access</h1>
            <p>You do not have permission to view this page.</p>
            <Link to="/">Return to Login</Link>
        </div>
    );
}

export default Unauthorized;
