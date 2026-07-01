/**
 * Helper script to set a user role to 'admin' in MongoDB.
 * Run this script with: node make-admin.js <email>
 * If no email is provided, it will make the first user in the database an admin.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const makeAdmin = async () => {
    const email = process.argv[2];

    if (!process.env.MONGO_URI) {
        console.error("❌ Error: MONGO_URI is missing in server/.env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB.");

        let user;
        if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                console.error(`❌ User not found with email: ${email}`);
                await mongoose.disconnect();
                process.exit(1);
            }
        } else {
            user = await User.findOne();
            if (!user) {
                console.error("❌ No users found in the database. Please register a user first.");
                await mongoose.disconnect();
                process.exit(1);
            }
            console.log(`ℹ️ No email specified. Selecting the first user found in database...`);
        }

        user.role = 'admin';
        await user.save();

        console.log(`\n🎉 Success! User "${user.name}" (${user.email}) is now an ADMIN.`);
        console.log(`👉 Start your backend server and login with this account to view "Admin Analytics" in the navigation dropdown.`);

    } catch (err) {
        console.error("❌ Error updating user role:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB.");
    }
};

makeAdmin();
