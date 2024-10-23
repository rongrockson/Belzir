import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function PurchaseForm() {
    const { user } = useAuth(); // Prefill user-related data
    const [description, setDescription] = useState('New Purchase Request'); // Prefilled description
    const [itemName, setItemName] = useState(''); // You can prefill with any default values as required
    const [quantity, setQuantity] = useState(5); // Prefilled quantity
    const [unitPrice, setUnitPrice] = useState(1000); // Prefilled with 0
    const [shippingCharges, setShippingCharges] = useState(20);
    const [taxAmount, setTaxAmount] = useState(20);
    const [approverEmail, setSupervisorEmail] = useState(''); // This field is not prefilled
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the default form submission behavior
        try {
            const totalPrice = quantity * unitPrice + shippingCharges + taxAmount;

            // Send data to the backend
            console.log('Submitting request...');
            console.log('url:' + process.env.REACT_APP_PURCHASE_SERVICE_URL);
            console.log('userId:' + user.id);
            const response = await fetch(`${process.env.REACT_APP_PURCHASE_SERVICE_URL}/purchases`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json', // Set the correct content type
                },
                body: JSON.stringify({
                    userId: user.id, // Prefilled from the user's auth info
                    description,
                    itemName,
                    quantity,
                    unitPrice,
                    totalPrice,
                    shippingCharges,
                    taxAmount,
                    approverEmail,
                    senderEmail: user.email, // Prefilled from the user's auth info
                }),
            });

            // Handle the response
            if (response.ok) {
                // Navigate to dashboard if the request was successful
                navigate('/user/dashboard');
            } else {
                console.error('Failed to submit request:', await response.text());
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    return (
        <div>
            <h1>New Purchase Request</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Item Name:
                    <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                </label>
                <br />
                <label>
                    Quantity:
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </label>
                <br />
                <label>
                    Unit Price:
                    <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
                </label>
                <br />
                <label>
                    Shipping Charges:
                    <input type="number" value={shippingCharges} onChange={(e) => setShippingCharges(e.target.value)} required />
                </label>
                <br />
                <label>
                    Tax Amount:
                    <input type="number" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} required />
                </label>
                <br />
                <label>
                    Supervisor's Email:
                    <input type="email" value={approverEmail} onChange={(e) => setSupervisorEmail(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Submit Request</button>
            </form>
        </div>
    );
}

export default PurchaseForm;
