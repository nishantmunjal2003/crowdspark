# MongoDB Setup Guide for CrowdSpark

## Problem
The error "Error saving quiz: Failed to save quiz" occurs because MongoDB is not properly configured.

## Solution Options

### Option 1: Use MongoDB Atlas (Cloud - Recommended for Quick Start)

1. **Create a free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account

2. **Create a cluster:**
   - Click "Build a Database"
   - Choose the FREE tier
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Create a database user:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (remember these!)
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Whitelist your IP address:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get your connection string:**
   - Go back to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)

6. **Update your .env file:**
   - Open `server/.env` file
   - Replace `<password>` with your actual password
   - Replace the database name at the end with `crowdspark`
   - Example: `MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/crowdspark?retryWrites=true&w=majority`

### Option 2: Install MongoDB Locally

1. **Download MongoDB:**
   - Go to https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows
   - Run the installer

2. **Install MongoDB:**
   - Choose "Complete" installation
   - Install MongoDB as a service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify MongoDB is running:**
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name MongoDB
   ```

4. **Update your .env file:**
   - Open `server/.env` file
   - Add: `MONGODB_URI=mongodb://localhost:27017/crowdspark`

## After Setup

1. **Restart the server:**
   ```bash
   npm start
   ```

2. **Verify connection:**
   - You should see: "✓ Connected to MongoDB successfully"
   - Visit http://localhost:3001/api/health to check status

3. **Test quiz creation:**
   - Go to http://localhost:5173/create-quiz
   - Create a quiz and save it
   - It should now work!

## Troubleshooting

### "MONGODB_URI environment variable is not set"
- Make sure you have a `.env` file in the `server` directory
- The file should contain `MONGODB_URI=...`

### "MongoDB connection error"
- **For Atlas:** Check your username, password, and IP whitelist
- **For Local:** Make sure MongoDB service is running
- Check the connection string format

### "Failed to save quiz"
- Check the server console for detailed error messages
- Visit http://localhost:3001/api/health to see MongoDB status
