#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AIRA – SSL Certificate Setup (Let's Encrypt - FREE)
# Run AFTER setup-vps.sh and after DNS is pointing to this VPS
# Run as root: bash ssl-setup.sh
# ═══════════════════════════════════════════════════════════════

echo "🔐 Installing Certbot for Free SSL..."
apt install -y certbot python3-certbot-nginx

echo "📜 Getting SSL certificate for airaworld.org..."
certbot --nginx \
  -d airaworld.org \
  -d www.airaworld.org \
  --non-interactive \
  --agree-tos \
  --email admin@airaworld.org \
  --redirect

echo "🔄 Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "✅ SSL Setup Complete!"
echo "   Your site is now: https://www.airaworld.org"
echo ""
echo "Now copy the HTTPS nginx config:"
echo "  cp /var/www/aira/nginx-aira.conf /etc/nginx/sites-available/aira"
echo "  nginx -t && systemctl reload nginx"
echo ""
