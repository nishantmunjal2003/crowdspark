# Google OAuth Setup Guide

## Getting Your Google Client ID

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it (e.g., "CrowdSpark")
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production URL (when deployed)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production URL (when deployed)
   - Click "Create"

5. **Copy Your Client ID**
   - You'll see a popup with your Client ID
   - Copy the Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)

## Configuration

### Client-Side (.env file)

Create a file `client/.env` with:

```env
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

### Server-Side (server/.env file)

Add to your `server/.env`:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

## Important Notes

- ✅ The `.env` files are gitignored for security
- ✅ Never commit your actual Client ID to version control
- ✅ Use `.env.example` files to show required variables
- ✅ Restart your dev server after adding environment variables

## Troubleshooting

**Error: "Google Login Failed"**
- Check that `VITE_GOOGLE_CLIENT_ID` is set in `client/.env`
- Verify the Client ID matches what's in Google Cloud Console
- Ensure you've added `http://localhost:5173` to authorized origins
- Restart your development server (`npm run dev`)

**Error: "Invalid token"**
- Check that `GOOGLE_CLIENT_ID` is set in `server/.env`
- Verify both client and server use the same Client ID
- Ensure the Google+ API is enabled in your project
