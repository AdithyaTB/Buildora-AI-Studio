const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'usd'
    },
    paymentIntentId: {
        type: String,
        unique: true,
        sparse: true
    },
    transactionId: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
        default: 'pending'
    },
    orderReference: {
        type: String
    },
    receiptUrl: {
        type: String
    },
    // Legacy fields for Razorpay / old checkout session compatibility
    planType: {
        type: String
    },
    status: {
        type: String
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    }
}, { timestamps: true });

// Add indexes for efficient search
paymentSchema.index({ userId: 1 });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
