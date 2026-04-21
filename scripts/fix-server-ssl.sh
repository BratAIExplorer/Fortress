#!/bin/bash
# Fortress Intelligence — Nginx & SSL Fix Script
# Resolves 404 Not Found and SSL "Not Secure" warnings

# 1. Update Nginx configuration
echo "🌐 Updating Nginx configuration..."
sudo cp ./scripts/nginx-fortress.conf /etc/nginx/sites-available/fortress

# 2. Enable the site and disable the default Ubuntu site
echo "🔗 Symlinking configuration..."
sudo ln -sf /etc/nginx/sites-available/fortress /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Verify Nginx configuration
echo "🔍 Verifying Nginx syntax..."
if ! sudo nginx -t; then
    echo "❌ Nginx configuration is invalid. Please check the config file."
    exit 1
fi

# 4. Install Certbot if missing
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# 5. Provision/Renew SSL
echo "🛡️ Provisioning SSL for fortressintelligence.space..."
# We use --expand to add the IP or www if needed, though IP SSL is limited
sudo certbot --nginx -d fortressintelligence.space -d www.fortressintelligence.space --non-interactive --agree-tos -m admin@fortress.ai --redirect

# 6. Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

# 7. Final Check
echo "✅ Done! Please try accessing the site via:"
echo "   https://fortressintelligence.space"
echo "   Note: SSL will only be fully 'Secure' via the domain name, not the raw IP."
