import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentApi } from '../../services/payment.api';

const PaymentPending = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    // Polling logic
    const checkStatus = async () => {
      try {
        if (!bookingId) return;
        const response = await paymentApi.getPaymentStatus(bookingId);
        
        if (response.success && response.data) {
          const status = response.data.status;
          
          if (status === 'PAID') {
            navigate('/payment-success', { replace: true });
          } else if (status === 'FAILED' || status === 'EXPIRED') {
            navigate('/payment-failed', { replace: true });
          }
          // If PENDING, do nothing and wait for next interval
        }
      } catch (error) {
        console.error("Error checking payment status", error);
      }
    };

    checkStatus(); // Initial check

    const intervalId = setInterval(() => {
      checkStatus();
      setSecondsLeft(10); // reset countdown
    }, 10000); // 10 seconds

    const countdownId = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, [bookingId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Pending</h2>
        <p className="text-blue-600 font-semibold mb-6">Waiting for Confirmation</p>
        
        <p className="text-gray-500 mb-4 text-sm">
          Please wait while we verify your payment with the provider. Do not close or refresh this window.
        </p>

        <div className="bg-blue-50 rounded-lg p-3 inline-block">
          <p className="text-sm text-blue-800 font-medium">
            Auto-refreshing in {secondsLeft}s...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
