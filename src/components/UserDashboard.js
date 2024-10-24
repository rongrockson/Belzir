import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PurchaseForm from './PurchaseForm';

function UserDashboard() {
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [expandedRequest, setExpandedRequest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const userId = user.id;
                console.log('userId:' + userId);
                console.log('process.env.REACT_APP_PURCHASE_SERVICE_URL:' + process.env.REACT_APP_PURCHASE_SERVICE_URL);
                const response = await fetch(`${process.env.REACT_APP_PURCHASE_SERVICE_URL}/purchases/${userId}`, {
                    credentials: 'include',
                    'Access-Control-Allow-Credentials': true,
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data.requests)) {
                        setRequests(data.requests);
                    } else {
                        setRequests([]);
                    }
                } else if (response.status === 401) {
                    logout();
                    navigate('/');
                } else {
                    console.error('Failed to fetch requests');
                }
            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        };

        fetchRequests();
    }, [logout, navigate, user.id]);

    const handleLogout = async () => {
        logout();
        navigate('/');
    };

    const toggleExpand = (requestId) => {
        setExpandedRequest(expandedRequest === requestId ? null : requestId);
    };

    const handleRequestSuccess = () => {
        // Hide the form after successful request and refresh the requests
        setShowForm(false);
    };

    return (
        <div>
            <h1>User Dashboard</h1>
            <p>Welcome!</p>
            <button onClick={handleLogout}>Logout</button>

            <h2>Your Requests(click to expand/collapse)</h2>
            <ul>
                {requests.map((request) => (
                    <li key={request._id}>
                        <div onClick={() => toggleExpand(request._id)}>
                            <strong>{request.itemName}</strong> - {request.status}
                        </div>
                        {expandedRequest === request._id && (
                            <div>
                                <p>Quantity: {request.quantity}</p>
                                <p>Unit Price: {request.unitPrice}</p>
                                <p>Total Price: {request.totalPrice}</p>
                                <p>Shipping Charges: {request.shippingCharges}</p>
                                <p>Tax Amount: {request.taxAmount}</p>
                                <p>Approver Email: {request.approverEmail}</p>
                                <p>Requester Email: {request.senderEmail}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Hide New Purchase Form' : 'Place a New Request'}
            </button>

            {showForm && <PurchaseForm onSuccess={handleRequestSuccess} />}
        </div>
    );
}

export default UserDashboard;