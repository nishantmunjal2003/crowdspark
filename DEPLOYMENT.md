# Deployment Guide for CrowdSpark

This guide explains how to deploy the CrowdSpark application to a Virtual Private Server (VPS) like DigitalOcean, AWS EC2, or Linode.

## Prerequisites

1.  **A VPS** running Ubuntu (20.04 or 22.04 recommended).
2.  **SSH Access** to your VPS.
3.  **Domain Name** (optional, but recommended for SSL).

## Step 1: Prepare the VPS

Connect to your VPS via SSH:
```bash
ssh root@your_vps_ip
```

Update the system and install necessary tools:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git
```

Install Node.js (Version 18 or 20):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Install PM2 (Process Manager) globally:
```bash
sudo npm install -g pm2
```

## Step 2: Clone the Repository

Navigate to a directory (e.g., `/var/www`) and clone your project:
```bash
mkdir -p /var/www
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> learningapp
cd learningapp
```
*Note: You may need to generate an SSH key on the VPS and add it to GitHub if your repo is private.*

## Step 3: Build the Frontend (Client)

Navigate to the client directory, install dependencies, and build:
```bash
cd client
npm install
npm run build
```
This will create a `dist` folder containing the production-ready frontend.

## Step 4: Setup the Backend (Server)

Navigate to the server directory and install dependencies:
```bash
cd ../server
npm install
```

Create the `.env` file:
```bash
nano .env
```
Paste your environment variables (update values as needed):
```env
PORT=3001
MONGODB_URI=mongodb://mongo:****@148.135.138.14:2000/crowdspark?tls=false&authSource=admin
```
*Press `Ctrl+X`, then `Y`, then `Enter` to save.*

## Step 5: Start the Application

Start the server using PM2:
```bash
pm2 start index.js --name "crowdspark-server"
```

Save the PM2 list so it restarts on reboot:
```bash
pm2 save
pm2 startup
```
*(Run the command output by `pm2 startup` if prompted)*

## Step 6: Access the App

Your application should now be running!
Since the server is configured to serve the frontend static files, you can access the full app at:
`http://your_vps_ip:3001`

## Optional: Setup Nginx & SSL (Recommended)

To access via a domain (e.g., `crowdspark.com`) and use HTTPS:

1.  **Install Nginx**: `sudo apt install nginx -y`
2.  **Configure Nginx**:
    Create a config file: `sudo nano /etc/nginx/sites-available/crowdspark`
    ```nginx
    server {
        listen 80;
        server_name your_domain.com;

        location / {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
3.  **Enable Site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/crowdspark /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```
4.  **SSL with Certbot**:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your_domain.com
    ```
