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

async function makeAdmin(emailInput) {
    try {
        const email = emailInput.trim();
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

        if (!user) {
            console.log(`✗ User with email "${email}" not found in database.`);
            console.log('Please ensure the user has signed up or registered first.');
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`✓ User ${user.email} (${user.name}) is already an admin.`);
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✓ Successfully granted ADMIN role to: ${user.email} (${user.name})`);
        console.log(`\nNow, when this user logs in, they can access:`);
        console.log(`  1. The "Admin" button in their Dashboard top bar`);
        console.log(`  2. Direct URL: http://localhost:5176/admin`);
        process.exit(0);
    } catch (err) {
        console.error('✗ Error updating user:', err.message);
        process.exit(1);
    }
}

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const cliEmail = process.argv[2];
        if (cliEmail) {
            await makeAdmin(cliEmail);
            return;
        }

        rl.question('Enter email address to make admin: ', async (email) => {
            await makeAdmin(email);
        });
    } catch (err) {
        console.error('✗ MongoDB connection error:', err.message);
        process.exit(1);
    }
}

createAdmin();
