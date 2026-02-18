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
        required: true // The full HTML file content
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
