const express = require('express');
const router = express.Router();
const { createCheckoutSession, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);

// Webhook must be raw body, so we handle it before express.json() in server.js.
// However, the route itself is defined here. Note it is NOT protected by JWT, 
// Stripe handles its own signature verification.
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
