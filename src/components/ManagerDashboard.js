import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal'; // Reusable Modal component

function ManagerDashboard() {
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [expandedRequest, setExpandedRequest] = useState(null); // Track expanded request
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${process.env.REACT_APP_PURCHASE_SERVICE_URL}/purchases/manager`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data.requests)) {
                        setRequests(data.requests);
                    } else {
                        setRequests([]);
                    }
                } else if (response.status === 401) {
                    await logout();
                    navigate('/');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch requests');
                }
            } catch (error) {
                setError(error.message || 'Failed to load requests. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [logout, navigate]);

    const handleLogout = async () => {
        logout();
        navigate('/');
    };

    const handleApproveRequest = async (requestId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_PURCHASE_SERVICE_URL}/purchases/${requestId}/approve`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setRequests(requests.map(request =>
                    request._id === requestId
                        ? { ...request, status: 'approved' }
                        : request
                ));
            } else if (response.status === 401) {
                await logout();
                navigate('/');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to approve request');
            }
        } catch (error) {
            setError(error.message || 'Failed to approve request. Please try again.');
        }
    };

    const handleRejectRequest = (request) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setIsRejectModalOpen(true);
    };

    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_PURCHASE_SERVICE_URL}/purchases/${selectedRequest._id}/reject`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (response.ok) {
                setRequests(requests.map(request =>
                    request._id === selectedRequest._id
                        ? { ...request, status: 'rejected', rejectionReason }
                        : request
                ));
                setIsRejectModalOpen(false);
                setSelectedRequest(null);
            } else if (response.status === 401) {
                await logout();
                navigate('/');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reject request');
            }
        } catch (error) {
            setError(error.message || 'Failed to reject request. Please try again.');
        }
    };

    const toggleExpand = (requestId) => {
        setExpandedRequest(expandedRequest === requestId ? null : requestId); // Toggle expand/collapse
    };

    // Sort requests by pending status first
    const sortedRequests = requests.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return 0;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading requests...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <div className="text-red-600">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manager Dashboard</h1>
                    <p className="text-gray-600">Welcome!</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <h2 className="text-xl font-semibold mb-4">Assigned Requests(Click to expand/collapse)</h2>
            <ul>
                {sortedRequests.map((request) => (
                    <li key={request._id}>
                        <div
                            className={`p-4 cursor-pointer rounded-lg mb-4 ${getStatusStyles(request.status)}`}
                            onClick={() => toggleExpand(request._id)}
                        >
                            <strong>{request.itemName}</strong> - {request.status}
                        </div>
                        {expandedRequest === request._id && (
                            <div className="p-4 border-l-4 border-gray-300 bg-gray-100 rounded-lg">
                                <p>Quantity: {request.quantity}</p>
                                <p>Unit Price: {request.unitPrice}</p>
                                <p>Total Price: {request.totalPrice}</p>
                                <p>Shipping Charges: {request.shippingCharges}</p>
                                <p>Tax Amount: {request.taxAmount}</p>
                                <p>Approver Email: {request.approverEmail}</p>
                                <p>Requester Email: {request.senderEmail}</p>
                                {request.status === 'pending' && (
                                    <div className="space-x-2 mt-4">
                                        <button
                                            onClick={() => handleApproveRequest(request._id)}
                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                                {request.status === 'rejected' && request.rejectionReason && (
                                    <p className="text-red-600 mt-2">Reason for Rejection: {request.rejectionReason}</p>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {/* Reject Reason Modal */}
            {isRejectModalOpen && selectedRequest && (
                <Modal onClose={() => setIsRejectModalOpen(false)}>
                    <h2 className="text-xl font-semibold mb-4">Reject Request</h2>
                    <p>Provide a reason for rejecting the request:</p>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full mt-2 p-2 border rounded"
                        rows="4"
                        placeholder="Enter rejection reason..."
                    ></textarea>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            onClick={() => setIsRejectModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitRejection}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Reject
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );

    // Helper function to get status styles
    function getStatusStyles(status) {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
}

export default ManagerDashboard;
