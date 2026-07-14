import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { paymentApi } from '../../services/payment.api';
import PaymentCard from '../../components/payment/PaymentCard';
import ErrorComponent from '../../components/payment/ErrorComponent';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data passed from previous page via state
  const bookingDetails = location.state?.bookingDetails;

  useEffect(() => {
    if (!bookingDetails) {
      setError("Payment details not found. Please initiate payment from your bill.");
    }
  }, [bookingDetails]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentApi.createInvoice({
        bookingId: bookingDetails.bookingId,
        guestName: bookingDetails.guestName,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        amount: bookingDetails.amount,
        description: bookingDetails.description
      });

      if (response.success && response.invoiceUrl) {
        // Redirect to Xendit Checkout
        window.location.href = response.invoiceUrl;
      } else {
        throw new Error('Failed to generate payment link');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during payment creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f7f3]/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error ? (
          <ErrorComponent 
            message={error} 
            onRetry={() => setError(null)} 
          />
        ) : (
          <PaymentCard
            title="Complete Your Payment"
            description={`Booking Reference: ${bookingId}`}
            amount={bookingDetails?.amount || 0}
            loading={loading}
            onPay={handlePayment}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
