// src/components/UserDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PurchaseForm from './PurchaseForm';

function UserDashboard() {
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let isActive = true;

        const fetchRequests = async () => {
            try {
                setError(null);
                const response = await fetch(`${process.env.REACT_APP_PURCHASE_SERVICE_URL}/purchases/${user.id}`, {
                    credentials: 'include',
                });

                if (!isActive) return;

                if (response.ok) {
                    const data = await response.json();
                    setRequests(Array.isArray(data.requests) ? data.requests : []);
                } else if (response.status === 401) {
                    await logout();
                    navigate('/', { replace: true });
                } else {
                    throw new Error('Failed to fetch requests');
                }
            } catch (error) {
                if (isActive) {
                    setError(error.message);
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchRequests();

        return () => {
            isActive = false;
        };
    }, [logout, navigate, user.id]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleExpand = (requestId) => {
        setExpandedRequest(expandedRequest === requestId ? null : requestId);
    };

    const handleRequestSuccess = () => {
        setShowForm(false);
        // Refresh requests
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">User Dashboard</h1>
                    <p className="text-gray-600">Welcome, {user?.fullName}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {showForm ? 'Hide New Purchase Form' : 'Place a New Request'}
                </button>
            </div>

            {showForm && <PurchaseForm onSuccess={handleRequestSuccess} />}

            <h2 className="text-xl font-semibold mb-4">Your Requests (Click to expand/collapse)</h2>
            <ul className="space-y-4">
                {requests.map((request) => (
                    <li key={request._id} className="border rounded-lg overflow-hidden">
                        <div
                            onClick={() => toggleExpand(request._id)}
                            className={`p-4 cursor-pointer ${request.status === 'pending'
                                    ? 'bg-yellow-100'
                                    : request.status === 'approved'
                                        ? 'bg-green-100'
                                        : request.status === 'rejected'
                                            ? 'bg-red-100'
                                            : 'bg-gray-100'
                                }`}
                        >
                            <strong>{request.itemName}</strong> - {request.status}
                        </div>
                        {expandedRequest === request._id && (
                            <div className="p-4 bg-white">
                                <p>Quantity: {request.quantity}</p>
                                <p>Unit Price: ${request.unitPrice}</p>
                                <p>Total Price: ${request.totalPrice}</p>
                                <p>Shipping Charges: ${request.shippingCharges}</p>
                                <p>Tax Amount: ${request.taxAmount}</p>
                                <p>Approver Email: {request.approverEmail}</p>
                                <p>Requester Email: {request.senderEmail}</p>
                                {request.status === 'rejected' && request.rejectionReason && (
                                    <p className="text-red-600 mt-2">
                                        Reason for Rejection: {request.rejectionReason}
                                    </p>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserDashboard;