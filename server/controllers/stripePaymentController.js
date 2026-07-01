const stripe = require('../config/stripe');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Credit = require('../models/Credit');

const PLANS = {
    'pro-monthly': { name: 'Pro Monthly', amount: 499, credits: 500, currency: 'inr' },
    'pro-yearly': { name: 'Pro Yearly', amount: 4999, credits: 8000, currency: 'inr' },
    'credits-199': { name: '₹199 Credit Pack', amount: 199, credits: 150, currency: 'inr' },
    'credits-399': { name: '₹399 Credit Pack', amount: 399, credits: 400, currency: 'inr' },
    'credits-799': { name: '₹799 Credit Pack', amount: 799, credits: 1000, currency: 'inr' }
};

// Fulfill successful payments and credit user accounts
const fulfillPayment = async (paymentIntent) => {
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (!payment) {
        console.error(`Payment record not found for PaymentIntent: ${paymentIntent.id}`);
        return null;
    }

    if (payment.paymentStatus === 'succeeded') {
        return payment;
    }

    let receiptUrl = '';
    let paymentMethod = '';
    let transactionId = paymentIntent.id;

    if (paymentIntent.latest_charge) {
        try {
            const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
            receiptUrl = charge.receipt_url || '';
            paymentMethod = charge.payment_method_details?.type || '';
            transactionId = charge.id;
        } catch (err) {
            console.error("Failed to retrieve charge info:", err);
        }
    }

    payment.paymentStatus = 'succeeded';
    payment.transactionId = transactionId;
    payment.paymentMethod = paymentMethod || 'card';
    payment.receiptUrl = receiptUrl;
    await payment.save();

    const user = await User.findById(payment.userId);
    if (user) {
        const planType = paymentIntent.metadata?.planType;
        let creditsToAdd = 0;

        if (planType === 'pro-monthly') {
            creditsToAdd = 500;
            user.plan = 'pro-monthly';
            user.isPro = true;
            user.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else if (planType === 'pro-yearly') {
            creditsToAdd = 8000;
            user.plan = 'pro-yearly';
            user.isPro = true;
            user.nextBillingDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        } else if (planType === 'credits-199') {
            creditsToAdd = 150;
        } else if (planType === 'credits-399') {
            creditsToAdd = 400;
        } else if (planType === 'credits-799') {
            creditsToAdd = 1000;
        }

        user.credits += creditsToAdd;
        await user.save();

        await Credit.create({
            userId: user._id,
            action: 'purchase',
            amount: creditsToAdd,
            description: `Stripe Payment: ${planType}`
        });

        console.log(`Successfully credited ${creditsToAdd} to user ${user._id}`);
    }

    return payment;
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
    try {
        const { planType } = req.body;
        const plan = PLANS[planType];

        if (!plan) {
            return res.status(400).json({ message: 'Invalid plan type' });
        }

        // Check if Stripe secret key is configured properly
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
            return res.status(500).json({ message: 'Stripe gateway key configuration missing.' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: plan.amount * 100, // Stripe expects amount in cents/paisa
            currency: plan.currency,
            metadata: {
                userId: req.user.id.toString(),
                planType: planType
            }
        });

        const payment = await Payment.create({
            userId: req.user.id,
            amount: plan.amount,
            currency: plan.currency,
            paymentIntentId: paymentIntent.id,
            paymentStatus: 'pending',
            orderReference: `ORD-${Date.now()}`
        });

        res.status(201).json({
            clientSecret: paymentIntent.client_secret,
            payment
        });
    } catch (error) {
        console.error("Create Payment Intent Error:", error);
        res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
    }
};

// @desc    Verify Stripe Payment Status
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ message: 'Payment Intent ID is required' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            const payment = await fulfillPayment(paymentIntent);
            return res.json({ status: 'succeeded', payment });
        } else {
            // Update status in DB
            const payment = await Payment.findOne({ paymentIntentId });
            if (payment) {
                payment.paymentStatus = 'failed';
                await payment.save();
            }
            return res.json({ status: paymentIntent.status, payment });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
};

// @desc    Get logged-in user payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';

        let query = { userId: req.user.id };

        if (status) {
            query.paymentStatus = status;
        }

        if (search) {
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { paymentIntentId: { $regex: search, $options: 'i' } },
                { orderReference: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Payment.countDocuments(query);
        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            payments,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Get Payment History Error:", error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
};

// @desc    Get detailed payment details
// @route   GET /api/payments/:id
// @access  Private
const getPaymentDetails = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('userId', 'name email');

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        // Allow owner or admin
        if (payment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(payment);
    } catch (error) {
        console.error("Get Payment Details Error:", error);
        res.status(500).json({ message: 'Failed to fetch payment details' });
    }
};

// @desc    Process refund (Admin only)
// @route   POST /api/payments/refund
// @access  Private (Admin)
const processRefund = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ message: 'Payment Intent ID is required' });
        }

        const payment = await Payment.findOne({ paymentIntentId });

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        if (payment.paymentStatus === 'refunded') {
            return res.status(400).json({ message: 'Payment is already refunded' });
        }

        // Create Stripe Refund
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId
        });

        payment.paymentStatus = 'refunded';
        await payment.save();

        // Optionally deduct user credits on refund
        const user = await User.findById(payment.userId);
        if (user) {
            // Revert credits based on planType
            const planType = payment.planType || 'pro-monthly';
            let creditsToRevert = 0;
            if (planType.includes('pro-monthly')) creditsToRevert = 500;
            else if (planType.includes('pro-yearly')) creditsToRevert = 8000;
            else if (planType.includes('199')) creditsToRevert = 150;
            else if (planType.includes('399')) creditsToRevert = 400;
            else if (planType.includes('799')) creditsToRevert = 1000;

            user.credits = Math.max(0, user.credits - creditsToRevert);
            if (planType.includes('pro')) {
                user.isPro = false;
                user.plan = 'free';
            }
            await user.save();

            await Credit.create({
                userId: user._id,
                action: 'generate', // Log deduction
                amount: -creditsToRevert,
                description: `Refunded: ${planType}`
            });
        }

        res.json({ message: 'Payment refunded successfully', refund, payment });
    } catch (error) {
        console.error("Refund Error:", error);
        res.status(500).json({ message: 'Failed to process refund', error: error.message });
    }
};

// @desc    Get admin payment stats
// @route   GET /api/payments/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
    try {
        const stats = await Payment.aggregate([
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        let totalRevenue = 0;
        let successfulPayments = 0;
        let failedPayments = 0;
        let refundCount = 0;

        stats.forEach(stat => {
            if (stat._id === 'succeeded') {
                totalRevenue = stat.totalAmount;
                successfulPayments = stat.count;
            } else if (stat._id === 'failed') {
                failedPayments = stat.count;
            } else if (stat._id === 'refunded') {
                refundCount = stat.count;
            }
        });

        // Revenue by month aggregation
        const monthlyStats = await Payment.aggregate([
            { $match: { paymentStatus: 'succeeded' } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
        ]);

        const recentTransactions = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email');

        res.json({
            totalRevenue,
            successfulPayments,
            failedPayments,
            refundCount,
            monthlyRevenue: monthlyStats.map(m => ({
                month: `${m._id.year}-${m._id.month.toString().padStart(2, '0')}`,
                revenue: m.revenue
            })),
            recentTransactions
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: 'Failed to fetch analytics stats' });
    }
};

// @desc    Stripe Webhook handler
// @route   POST /api/payments/webhook
// @access  Public
const stripeWebhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        console.log(`Received Webhook event: ${event.type}`);

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                await fulfillPayment(paymentIntent);
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
                if (payment) {
                    payment.paymentStatus = 'failed';
                    await payment.save();
                    console.log(`Payment marked failed for PaymentIntent: ${paymentIntent.id}`);
                }
                break;
            }
            case 'payment_intent.canceled': {
                const paymentIntent = event.data.object;
                const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
                if (payment) {
                    payment.paymentStatus = 'failed';
                    await payment.save();
                }
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object;
                const payment = await Payment.findOne({ paymentIntentId: charge.payment_intent });
                if (payment && payment.paymentStatus !== 'refunded') {
                    payment.paymentStatus = 'refunded';
                    await payment.save();
                    console.log(`Payment marked refunded for PaymentIntent: ${charge.payment_intent}`);
                }
                break;
            }
            case 'checkout.session.completed': {
                // Handle Checkout Session flow if used
                const session = event.data.object;
                if (session.payment_intent) {
                    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                    await fulfillPayment(paymentIntent);
                }
                break;
            }
            default:
                console.log(`Unhandled webhook event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ error: 'Webhook handler error' });
    }
};

module.exports = {
    createPaymentIntent,
    verifyPayment,
    getPaymentHistory,
    getPaymentDetails,
    processRefund,
    getAdminStats,
    stripeWebhookHandler
};
