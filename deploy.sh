#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AIRA – Deploy / Update Script
# Run on VPS to pull latest changes: bash deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e
echo ""
echo "🚀 Deploying AIRA update..."
echo ""

cd /var/www/aira

# Pull latest from GitHub
echo "📥 Pulling latest code..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
cd backend && npm install --production && cd ..

# Reload PM2 (zero-downtime restart)
echo "🔄 Reloading server..."
pm2 reload aira-backend --update-env

echo ""
echo "✅ Deploy complete!"
pm2 status aira-backend
echo ""
