#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AIRA – Complete VPS Setup Script
# Nepal VPS 1 (2GB RAM) — airaworld.org
# Run as root: bash setup-vps.sh
# ═══════════════════════════════════════════════════════════════

set -e   # Exit on any error

echo ""
echo "═══════════════════════════════════════════"
echo "  AIRA VPS Setup — airaworld.org"
echo "═══════════════════════════════════════════"
echo ""

# ── STEP 1: System Update ──────────────────────────────────────
echo "📦 [1/9] Updating system packages..."
apt update -y && apt upgrade -y
apt install -y curl wget git nano ufw unzip htop

# ── STEP 2: Install Node.js 20 ────────────────────────────────
echo "🟢 [2/9] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "   Node: $(node --version) | npm: $(npm --version)"

# ── STEP 3: Install PM2 ───────────────────────────────────────
echo "⚙️  [3/9] Installing PM2 process manager..."
npm install -g pm2
pm2 startup systemd -u root --hp /root

# ── STEP 4: Install Nginx ─────────────────────────────────────
echo "🌐 [4/9] Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# ── STEP 5: Firewall ──────────────────────────────────────────
echo "🔒 [5/9] Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "   Firewall rules: SSH, HTTP, HTTPS allowed"

# ── STEP 6: Create project directory ──────────────────────────
echo "📁 [6/9] Setting up project directory..."
mkdir -p /var/www/aira/{frontend,backend,logs}

# ── STEP 7: Clone/Copy Project ────────────────────────────────
echo "📥 [7/9] Cloning AIRA project from GitHub..."
if [ -d "/var/www/aira/backend/node_modules" ]; then
  echo "   Project already exists. Pulling latest..."
  cd /var/www/aira
  git pull origin main
else
  cd /var/www
  # Clone your repository
  git clone https://github.com/airaworld1982-hub/aira-project.git aira-temp
  cp -r aira-temp/frontend/* /var/www/aira/frontend/
  cp -r aira-temp/backend/* /var/www/aira/backend/
  cp aira-temp/ecosystem.config.js /var/www/aira/ 2>/dev/null || true
  rm -rf aira-temp
fi

# ── STEP 8: Install Node dependencies ─────────────────────────
echo "📦 [8/9] Installing Node.js dependencies..."
cd /var/www/aira/backend
npm install --production

# ── STEP 9: Setup Nginx ───────────────────────────────────────
echo "🌐 [9/9] Configuring Nginx..."
cat > /etc/nginx/sites-available/aira << 'NGINXEOF'
# Temporary HTTP config (before SSL)
server {
    listen 80;
    listen [::]:80;
    server_name airaworld.org www.airaworld.org;

    client_max_body_size 30M;

    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    root /var/www/aira/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/aira /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ VPS Setup Complete!"
echo "═══════════════════════════════════════════"
echo ""
echo "  Next steps:"
echo "  1. Upload your .env file to /var/www/aira/backend/.env"
echo "  2. Run: cd /var/www/aira && pm2 start ecosystem.config.js --env production"
echo "  3. Run: node backend/scripts/seedCredentials.js"
echo "  4. Setup SSL: bash ssl-setup.sh"
echo ""
