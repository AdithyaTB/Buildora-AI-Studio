const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "https://i.imgur.com/placeholder-avatar.png"
    },
    banner: {
        type: String,
        default: "https://i.imgur.com/placeholder-banner.png"
    },
    bio: { type: String, default: '' },
    title: { type: String, default: '' },
    location: { type: String, default: '' },
    skills: { type: [String], default: [] },
    socials: { // Keeping 'socials' for backward compatibility
        github: { type: String, default: '' },
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        portfolio: { type: String, default: '' }
    },
    preferences: {
        theme: { type: String, default: "dark" },
        framework: { type: String, default: "html-tailwind-js" },
        palette: { type: String, default: "" },
        language: { type: String, default: "en" }
    },
    plan: {
        type: String,
        enum: ['free', 'pro-monthly', 'pro-yearly'],
        default: 'free'
    },
    isPro: {
        type: Boolean,
        default: false
    },
    credits: { type: Number, default: 50 },
    creditsUsed: { type: Number, default: 0 },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    nextBillingDate: { type: Date },
    stats: {
        websitesGenerated: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        views: { type: Number, default: 0 }
    },
    visibility: {
        showProfile: { type: Boolean, default: true },
        showProjects: { type: Boolean, default: true }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
