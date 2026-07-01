const express = require('express');
const router = express.Router();
const {
    createPaymentIntent,
    verifyPayment,
    getPaymentHistory,
    getPaymentDetails,
    processRefund,
    getAdminStats,
    stripeWebhookHandler
} = require('../controllers/stripePaymentController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Public route for webhook (signature validation occurs inside the controller)
router.post('/webhook', stripeWebhookHandler);

// Protected routes (require JWT authentication)
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/admin/stats', protect, adminProtect, getAdminStats);
router.post('/refund', protect, adminProtect, processRefund);
router.get('/:id', protect, getPaymentDetails);

module.exports = router;
