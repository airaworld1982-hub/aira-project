# AIRA – Complete VPS Deployment Guide
# Nepal VPS 1 (2GB RAM) — airaworld.org
# ═══════════════════════════════════════════════════════════════

## YOUR SERVER DETAILS
- **IP:**       Your Nepal VPS IP
- **Domain:**   airaworld.org / www.airaworld.org
- **OS:**       Ubuntu 22.04 LTS
- **RAM:**      2GB
- **Stack:**    Node.js 20 + Nginx + MongoDB Atlas + PM2

---

## STEP 1 — Connect to VPS via SSH

Open terminal on your Mac:
```bash
ssh root@YOUR_VPS_IP
```

---

## STEP 2 — Upload Files to VPS

From your Mac, upload the project files:
```bash
# Upload the entire project
scp -r ~/Desktop/aira-project root@YOUR_VPS_IP:/tmp/aira-upload

# Or use Git (recommended)
# Push to GitHub first, then on VPS do: git clone
```

---

## STEP 3 — Run Setup Script on VPS

```bash
# On VPS:
cd /tmp/aira-upload
chmod +x setup-vps.sh ssl-setup.sh deploy.sh
bash setup-vps.sh
```

This installs: Node.js, PM2, Nginx, UFW firewall

---

## STEP 4 — Upload .env File

On your Mac, create the .env and upload:
```bash
scp .env root@YOUR_VPS_IP:/var/www/aira/backend/.env
```

Or create directly on VPS:
```bash
nano /var/www/aira/backend/.env
```

Paste this content:
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://airauser:Aira2025@cluster0.cjx2go5.mongodb.net/aira_db?retryWrites=true&w=majority
JWT_SECRET=aira_super_secret_key_2025_nepal_vps_change_this
JWT_EXPIRES_IN=8h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=aira2020@@
ADMIN_EMAIL=admin@airaworld.org
FRONTEND_URL=https://www.airaworld.org
PUSHER_APP_ID=2163765
PUSHER_KEY=8aae08c772b3016e4c6d
PUSHER_SECRET=1886deff6d024d12e5e6
PUSHER_CLUSTER=ap2
```

---

## STEP 5 — Copy Project Files to Web Root

```bash
# If you uploaded to /tmp/aira-upload:
cp -r /tmp/aira-upload/frontend/* /var/www/aira/frontend/
cp -r /tmp/aira-upload/backend/*  /var/www/aira/backend/
cp /tmp/aira-upload/ecosystem.config.js /var/www/aira/

# Install backend dependencies
cd /var/www/aira/backend
npm install --production
```

---

## STEP 6 — Seed Default Credentials to MongoDB

```bash
cd /var/www/aira/backend
node scripts/seedCredentials.js
```

You should see:
```
✅ Created: [classroom]   aira@classroom  / class2025
✅ Created: [conference]  aira@conference / conf2025
✅ Created: [recordings]  student@aira    / aira2025
```

---

## STEP 7 — Start the Application with PM2

```bash
cd /var/www/aira
pm2 start ecosystem.config.js --env production
pm2 save
pm2 status
```

You should see:
```
┌─────────────────┬────┬──────┬───────┬─────────┐
│ name            │ id │ mode │ pid   │ status  │
├─────────────────┼────┼──────┼───────┼─────────┤
│ aira-backend    │ 0  │ fork │ 12345 │ online  │
└─────────────────┴────┴──────┴───────┴─────────┘
```

Test it works:
```bash
curl http://localhost:3001/api/health
# Should return: {"success":true,"status":"OK",...}
```

---

## STEP 8 — Configure DNS

In your domain control panel (Prabhu Host / Cloudflare):

| Type  | Name | Value           | TTL |
|-------|------|-----------------|-----|
| A     | @    | YOUR_VPS_IP     | 300 |
| A     | www  | YOUR_VPS_IP     | 300 |

Wait 5-15 minutes for DNS to propagate.

Test:
```bash
ping airaworld.org
# Should show YOUR_VPS_IP
```

---

## STEP 9 — Setup Free SSL Certificate

```bash
bash /var/www/aira/ssl-setup.sh
```

This gets a free Let's Encrypt SSL for both:
- https://airaworld.org
- https://www.airaworld.org

---

## STEP 10 — Install Full HTTPS Nginx Config

```bash
cp /var/www/aira/nginx-aira.conf /etc/nginx/sites-available/aira
nginx -t
systemctl reload nginx
```

---

## STEP 11 — Test Everything

```bash
# 1. API health check
curl https://www.airaworld.org/api/health

# 2. Test credential login
curl -X POST https://www.airaworld.org/api/credentials/verify \
  -H "Content-Type: application/json" \
  -d '{"type":"classroom","userid":"aira@classroom","password":"class2025"}'

# 3. Check PM2 logs
pm2 logs aira-backend --lines 50

# 4. Check Nginx logs
tail -f /var/log/nginx/aira-error.log
```

---

## USEFUL COMMANDS

```bash
# Server status
pm2 status

# View live logs
pm2 logs aira-backend

# Restart app
pm2 restart aira-backend

# Stop app
pm2 stop aira-backend

# Reload nginx
systemctl reload nginx

# Check disk space
df -h

# Check RAM usage
free -h

# Check what's using port 3001
lsof -i :3001

# MongoDB connection test
cd /var/www/aira/backend
node -e "require('./config/db')()"
```

---

## FUTURE UPDATES (Deploy New Code)

```bash
# On your Mac — push to GitHub:
cd ~/Desktop/aira-project
git add .
git commit -m "Update"
git push origin main

# On VPS — pull and deploy:
bash /var/www/aira/deploy.sh
```

---

## FILE STRUCTURE ON VPS

```
/var/www/aira/
├── frontend/
│   └── index.html          ← Your website
├── backend/
│   ├── server.js           ← Main server
│   ├── .env                ← Secret config
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/             ← MongoDB models
│   ├── routes/             ← API routes
│   ├── scripts/
│   │   └── seedCredentials.js
│   ├── logs/               ← Server logs
│   └── node_modules/
├── ecosystem.config.js     ← PM2 config
├── nginx-aira.conf         ← Nginx config
├── setup-vps.sh            ← Setup script
├── deploy.sh               ← Update script
└── logs/                   ← PM2 logs
```

---

## TROUBLESHOOTING

**App not starting?**
```bash
pm2 logs aira-backend
# Check for .env missing or MongoDB connection error
```

**502 Bad Gateway?**
```bash
pm2 status   # Is app running?
curl http://localhost:3001/api/health  # Is port 3001 working?
```

**MongoDB connection error?**
```bash
# Check your MONGODB_URI in .env
# Make sure MongoDB Atlas allows 0.0.0.0/0 in Network Access
```

**SSL not working?**
```bash
certbot renew --dry-run
systemctl status certbot.timer
```

---

## SECURITY CHECKLIST

- [ ] Changed JWT_SECRET in .env
- [ ] Changed admin password (aira2020@@)  
- [ ] MongoDB Atlas IP whitelist set (or 0.0.0.0/0 for VPS)
- [ ] UFW firewall enabled (only 22, 80, 443 open)
- [ ] .env file not in Git (.gitignore)
- [ ] SSL certificate installed
- [ ] PM2 startup configured (auto-start on reboot)

---

*AIRA – Axon Infotech Research Academy | airaworld.org*
