#!/bin/bash
set -e

# Fortress Intelligence - VPS Setup Script
# Ubuntu/Debian compatible

echo "🚀 Starting VPS Setup..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20 (LTS)
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx
sudo ufw allow 'Nginx Full'

# 4. Install PostgreSQL
echo "🐘 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# 5. Install PM2 Globally
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# 6. Basic Firewall Setup (Optional but recommended)
echo "🛡️ Configuring Firewall..."
sudo ufw allow OpenSSH
sudo ufw enable

# 7. Create App Directory (Isolation)
echo "file_folder: Creating /opt/fortress..."
sudo mkdir -p /opt/fortress
sudo chown -R $USER:$USER /opt/fortress
sudo chmod -R 755 /opt/fortress

echo "✅ Setup Complete!"
echo "Next steps:"
echo "1. Clone into the new folder: git clone <repo_url> /opt/fortress/app"
echo "2. Create your database user: sudo -u postgres createuser --interactive"
echo "3. Run your app from /opt/fortress/app"
