import api from './axios';

export const createPaymentIntent = async (planType) => {
    const { data } = await api.post('/payments/create-payment-intent', { planType });
    return data;
};

export const verifyPayment = async (paymentIntentId) => {
    const { data } = await api.post('/payments/verify', { paymentIntentId });
    return data;
};

export const getPaymentHistory = async (params = {}) => {
    const { data } = await api.get('/payments/history', { params });
    return data;
};

export const getPaymentDetails = async (id) => {
    const { data } = await api.get(`/payments/${id}`);
    return data;
};

export const processRefund = async (paymentIntentId) => {
    const { data } = await api.post('/payments/refund', { paymentIntentId });
    return data;
};

export const getAdminStats = async () => {
    const { data } = await api.get('/payments/admin/stats');
    return data;
};
