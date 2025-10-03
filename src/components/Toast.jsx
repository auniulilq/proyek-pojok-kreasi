import React from 'react';

const Toast = ({ message, type, onClose }) => {
    // Menentukan warna berdasarkan tipe notifikasi
    const color = type === 'error' ? '#D32F2F' : type === 'warning' ? '#FF9800' : '#4CAF50';
    
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: color,
            color: 'white',
            padding: '15px 25px',
            borderRadius: '8px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            // Animasi masuk (opacity dan slight transform)
            opacity: 0,
            transform: 'translateY(50px)',
            animation: 'toast-in 0.4s ease-out forwards', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '300px'
        }}>
            {/* Style untuk Animasi masuk */}
            <style>
                {`
                    @keyframes toast-in {
                        from { opacity: 0; transform: translateY(50px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
            <span>{message}</span>
            <button 
                onClick={onClose} 
                style={{ 
                    marginLeft: '10px', 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '1.2em'
                }}
            >
                &times;
            </button>
        </div>
    );
};

export default Toast;
