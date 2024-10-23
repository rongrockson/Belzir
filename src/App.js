
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UserDashboard from './components/UserDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import PurchaseForm from './components/PurchaseForm';
import Login from './components/Login';
import Unauthorized from './components/Unauthorized';
import RoleSelection from './components/RoleSelection';

function DashboardRedirect() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />; // Redirect to login if not logged in
    }

    if (!user.role) {
        return <Navigate to="/select-role" replace />;
    }

    // Redirect based on the user's role
    if (user.role === 'manager') {
        return <Navigate to="/manager/dashboard" replace />;
    } else {
        return <Navigate to="/user/dashboard" replace />;
    }
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/select-role" element={<RoleSelection />} />
                        <Route path="/dashboard" element={<DashboardRedirect />} />

                        <Route element={<PrivateRoute allowedRoles={['user']} />}>
                            <Route path="/user/dashboard" element={<UserDashboard />} />
                        </Route>

                        <Route element={<PrivateRoute allowedRoles={['manager']} />}>
                            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                        </Route>

                        <Route element={<PrivateRoute allowedRoles={['user', 'manager']} />}>
                            <Route path="/purchase/new" element={<PurchaseForm />} />
                        </Route>
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;