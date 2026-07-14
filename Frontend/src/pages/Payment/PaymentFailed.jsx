import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h2>
        
        <p className="text-gray-500 mb-8 text-sm">
          Unfortunately, your payment could not be processed. Please check your payment method and try again, or use a different card.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)} // go back to retry
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
