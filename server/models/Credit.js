const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['generate', 'purchase', 'bonus'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Credit', creditSchema);
