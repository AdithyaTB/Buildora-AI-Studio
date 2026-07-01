const Stripe = require('stripe');

// Initialize with a dummy key if env is not yet set, avoiding immediate node crashes
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = Stripe(stripeKey);

module.exports = stripe;
