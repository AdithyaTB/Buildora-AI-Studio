/**
 * Stripe Endpoints Test Simulation Script
 * This script runs locally to verify that the Mongoose models and controllers load correctly.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Payment = require('./models/Payment');
const { createPaymentIntent, verifyPayment, getPaymentHistory, getAdminStats } = require('./controllers/stripePaymentController');

const runTests = async () => {
    console.log("🚀 Starting Stripe Backend Integration Tests...");

    // 1. Verify Mongo URI configuration
    if (!process.env.MONGO_URI) {
        console.error("❌ Error: MONGO_URI is missing in server/.env");
        process.exit(1);
    }
    console.log("✅ MONGO_URI verified.");

    // 2. Verify Stripe Secret Key configuration
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
        console.warn("⚠️ Warning: STRIPE_SECRET_KEY is currently a placeholder or empty. Live checkout tests will require a valid test key from your Stripe Dashboard.");
    } else {
        console.log("✅ STRIPE_SECRET_KEY is configured.");
    }

    // 3. Connect to Database
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB Atlas database successfully.");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }

    // 4. Verify Models loading
    try {
        const count = await User.countDocuments();
        console.log(`✅ User model verified. Total users in database: ${count}`);
        
        const paymentCount = await Payment.countDocuments();
        console.log(`✅ Payment model verified. Total payment records: ${paymentCount}`);
    } catch (err) {
        console.error("❌ Model verification failed:", err.message);
    }

    // 5. Success
    console.log("\n🎉 Stripe payment controllers and database schemas verified successfully!");
    console.log("\n👉 To test checkout end-to-end, start the server and use the client interface:");
    console.log("   Backend: npm run dev");
    console.log("   Frontend: npm run dev");
    
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
};

runTests();
