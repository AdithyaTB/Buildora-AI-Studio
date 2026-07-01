const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Untitled Project'
    },
    prompt: {
        type: String,
        required: true
    },
    generatedCode: {
        type: String,
        required: true // The initial AI output snippet
    },
    fullSourceCode: {
        type: String,
        // Optional because older projects might not have it yet
        required: false // The complete HTML document for community/profile viewing and downloading
    },
    updatedPromptHistory: [{
        prompt: String,
        timestamp: { type: Date, default: Date.now }
    }],
    isPublic: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
