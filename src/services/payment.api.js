import api from './api'; // assuming api is configured axios instance

export const paymentApi = {
  createInvoice: async (data) => {
    const response = await api.post('/payment/create-invoice', data);
    return response.data;
  },
  
  createQrCode: async (data) => {
    const response = await api.post('/payment/create-qr', data);
    return response.data;
  },
  
  getPaymentStatus: async (bookingId) => {
    const response = await api.get(`/payment/status/${bookingId}`);
    return response.data;
  }
};
