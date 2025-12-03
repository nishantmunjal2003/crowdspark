// Script to create an admin user
// Run this with: node scripts/createAdmin.js

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Get email from user
        rl.question('Enter email address to make admin: ', async (email) => {
            try {
                const user = await User.findOne({ email: email.trim() });

                if (!user) {
                    console.log(`✗ User with email ${email} not found`);
                    console.log('Please ensure the user has signed up first');
                    process.exit(1);
                }

                if (user.role === 'admin') {
                    console.log(`✓ User ${email} is already an admin`);
                    process.exit(0);
                }

                // Update to admin
                user.role = 'admin';
                await user.save();

                console.log(`✓ Successfully made ${email} an admin!`);
                console.log(`User details:`);
                console.log(`  Name: ${user.name}`);
                console.log(`  Email: ${user.email}`);
                console.log(`  Role: ${user.role}`);
                console.log(`\nThe user can now access the admin dashboard at /admin`);

                process.exit(0);
            } catch (err) {
                console.error('✗ Error:', err.message);
                process.exit(1);
            }
        });
    } catch (err) {
        console.error('✗ MongoDB connection error:', err.message);
        process.exit(1);
    }
}

createAdmin();
