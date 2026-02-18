const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Credit = require('../models/Credit');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { plan } = req.body;

        let amount;
        if (plan === 'pro') {
            amount = 29900; // ₹299
        } else if (plan === 'yearly') {
            amount = 299900; // ₹2999
        } else {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}_${req.user._id}`,
        };

        const order = await razorpay.orders.create(options);

        // Save pending payment attempt
        await Payment.create({
            userId: req.user._id,
            amount: amount / 100,
            planType: plan,
            status: 'pending',
            razorpayOrderId: order.id
        });

        res.json(order);
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: 'Payment Order Failed' });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 1. Update Payment Status
            const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
            if (payment) {
                payment.status = 'completed';
                payment.razorpayPaymentId = razorpay_payment_id;
                payment.razorpaySignature = razorpay_signature;
                await payment.save();
            }

            // 2. Update User Credits & Plan
            const user = await User.findById(req.user.id);
            let creditsToAdd = 0;

            if (plan === "pro") {
                creditsToAdd = 500;
                user.plan = "pro";
            } else if (plan === "yearly") {
                creditsToAdd = 8000;
                user.plan = "yearly";
            }

            user.credits += creditsToAdd;
            await user.save();

            // 3. Log Credit Transaction
            await Credit.create({
                userId: req.user.id,
                action: 'purchase',
                amount: creditsToAdd,
                description: `Purchased ${plan} plan`
            });

            res.json({ success: true, message: "Payment verified and credits added" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: 'Payment Verification Failed' });
    }
};

module.exports = { createOrder, verifyPayment };
