// src/components/Modal.js
import React from 'react';

function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}

export default Modal;
