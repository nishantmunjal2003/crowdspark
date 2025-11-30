require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...\n');

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not set in .env file');
    console.error('\nPlease check your server/.env file');
    process.exit(1);
}

// Mask password in connection string for display
const maskedUri = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log('Connection String:', maskedUri);
console.log('\nAttempting to connect...\n');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log('   Database:', mongoose.connection.name);
        console.log('   Host:', mongoose.connection.host);
        console.log('\nYour MongoDB connection is working correctly!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILED to connect to MongoDB');
        console.error('\nError:', err.message);
        console.error('\nCommon issues:');
        console.error('1. Check your username and password in the connection string');
        console.error('2. Make sure your IP address is whitelisted in MongoDB Atlas');
        console.error('3. Verify the connection string format');
        console.error('\nConnection string format should be:');
        console.error('mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
        process.exit(1);
    });
