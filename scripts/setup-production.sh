#!/bin/bash
set -e

# Fortress Intelligence - Nginx & SSL Auto-Setup
# This script configures Nginx as a reverse proxy for the app running on port 3000
# and prepares the environment for Let's Encrypt SSL.

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: Please provide a domain name."
    echo "Usage: sudo ./setup-nginx.sh yourdomain.com"
    exit 1
fi

echo "🌐 Configuring Nginx for $DOMAIN..."

# 1. Create Nginx config
cat <<EOF > /etc/nginx/sites-available/fortress
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 2. Enable the site
ln -sf /etc/nginx/sites-available/fortress /etc/nginx/sites-enabled/fortress
rm -f /etc/nginx/sites-enabled/default

# 3. Test and restart Nginx
nginx -t
systemctl restart nginx

echo "✅ Nginx configured! App is now available at http://$DOMAIN"

# 4. SSL Setup (Let's Encrypt)
echo "🔒 Would you like to set up SSL now? (y/n)"
read setup_ssl

if [ "$setup_ssl" == "y" ]; then
    echo "📦 Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
    echo "🛡️ Running Certbot..."
    certbot --nginx -d $DOMAIN
    echo "✅ SSL Configuration Complete!"
else
    echo "⚠️ Skipping SSL. Remember to set it up later for secure Auth.js cookies."
fi
