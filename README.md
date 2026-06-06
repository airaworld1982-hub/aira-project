# AIRA – Axon Infotech Research Academy
### Full-Stack Deployment Guide

---

## 📁 Project Structure

```
aira-project/
├── frontend/
│   └── index.html              ← Complete single-page frontend (SPA)
├── backend/
│   ├── server.js               ← Express entry point
│   ├── package.json
│   ├── .env.example            ← Copy to .env and fill in values
│   ├── config/
│   │   └── db.js               ← MongoDB connection
│   ├── middleware/
│   │   └── auth.js             ← JWT authentication middleware
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Blog.js
│   │   ├── Project.js
│   │   ├── Announcement.js
│   │   ├── Media.js
│   │   ├── Team.js
│   │   ├── Message.js
│   │   ├── Credential.js
│   │   ├── Service.js
│   │   └── About.js
│   ├── routes/
│   │   ├── auth.js             ← POST /api/auth/login
│   │   ├── blogs.js            ← /api/blogs
│   │   ├── projects.js         ← /api/projects
│   │   ├── announcements.js    ← /api/announcements
│   │   ├── media.js            ← /api/media
│   │   ├── team.js             ← /api/team
│   │   ├── messages.js         ← /api/messages
│   │   ├── credentials.js      ← /api/credentials
│   │   ├── about.js            ← /api/about
│   │   ├── services.js         ← /api/services
│   │   ├── stats.js            ← /api/stats
│   │   └── signal.js           ← /api/signal (WebRTC Pusher)
│   └── scripts/
│       └── seed.js             ← Database seed script
├── vercel.json                 ← Vercel deployment config
├── .gitignore
└── README.md
```

---

## 🚀 Option A — Deploy on Vercel (Recommended, Free)

### Prerequisites
- Node.js 18+
- A free [MongoDB Atlas](https://cloud.mongodb.com) account
- A free [Vercel](https://vercel.com) account
- A free [Pusher](https://pusher.com) account (for live classroom)

### Step 1 — Set up MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create a free cluster (M0)
2. **Database Access** → Add user → note username & password
3. **Network Access** → Add IP → `0.0.0.0/0` (allow all — Vercel uses dynamic IPs)
4. **Connect** → Drivers → Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/aira_db?retryWrites=true&w=majority
   ```

### Step 2 — Set up Pusher (for live classroom/conference)

1. Go to [pusher.com](https://pusher.com) → Sign up → Create App → Channels
2. Choose cluster: **ap2** (South Asia) or nearest region
3. Copy from **App Keys** tab: `app_id`, `key`, `secret`, `cluster`

### Step 3 — Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Clone / download this project, then:
cd aira-project
vercel

# Follow the prompts:
# - Link to your Vercel account
# - Project name: aira-website
# - Root directory: ./  (press Enter)
```

### Step 4 — Set Environment Variables on Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | Any 64-char random string |
| `JWT_EXPIRES_IN` | `8h` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `YourStrongPassword123!` |
| `ADMIN_EMAIL` | `admin@airaworld.org` |
| `PUSHER_APP_ID` | From Pusher dashboard |
| `PUSHER_KEY` | From Pusher dashboard |
| `PUSHER_SECRET` | From Pusher dashboard |
| `PUSHER_CLUSTER` | `ap2` |
| `FRONTEND_URL` | `https://your-project.vercel.app` |
| `NODE_ENV` | `production` |

Then redeploy: `vercel --prod`

### Step 5 — Update Frontend Config

Open `frontend/index.html`, find the Pusher config section (~line 3886) and update:

```javascript
const PUSHER_KEY     = (window._ENV && window._ENV.PUSHER_KEY) || 'YOUR_PUSHER_KEY';
const PUSHER_CLUSTER = (window._ENV && window._ENV.PUSHER_CLUSTER) || 'ap2';
```

Or inject via a `<script>` tag before the main script:
```html
<script>
  window._ENV = {
    PUSHER_KEY: 'your_pusher_key',
    PUSHER_CLUSTER: 'ap2'
  };
</script>
```

### Step 6 — Seed Initial Data (Optional)

```bash
cd backend
cp .env.example .env
# Fill in your MONGODB_URI in .env
npm install
npm run seed
```

---

## 🖥️ Option B — Self-Hosted VPS (Ubuntu 22.04)

### Step 1 — Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 2 — Clone & Configure

```bash
# Upload project files to /var/www/aira
sudo mkdir -p /var/www/aira
sudo chown $USER:$USER /var/www/aira

# Copy project files
cp -r aira-project/* /var/www/aira/

# Install backend dependencies
cd /var/www/aira/backend
npm install --production

# Set up environment
cp .env.example .env
nano .env  # Fill in all values
```

### Step 3 — Start Backend with PM2

```bash
cd /var/www/aira/backend
pm2 start server.js --name aira-backend
pm2 save
pm2 startup  # Follow the output command to auto-start on reboot
```

### Step 4 — Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/airaworld.org
```

```nginx
server {
    listen 80;
    server_name airaworld.org www.airaworld.org;

    # Frontend (static files)
    root /var/www/aira/frontend;
    index index.html;

    # Serve frontend for all non-API routes (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Express backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

```bash
sudo ln -s /etc/nginx/sites-available/airaworld.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5 — SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d airaworld.org -d www.airaworld.org
# Certbot auto-renews; verify: sudo certbot renew --dry-run
```

### Step 6 — Seed Database

```bash
cd /var/www/aira/backend
node scripts/seed.js
```

---

## 🗄️ MongoDB Collections Reference

| Collection | Description |
|------------|-------------|
| `admins` | Admin user accounts (bcrypt passwords) |
| `blogs` | Blog posts and articles |
| `projects` | Research projects (current & past) |
| `announcements` | Events, vacancies, publications |
| `media` | Gallery photos and documents |
| `teams` | Team member profiles |
| `messages` | Contact form submissions |
| `credentials` | Classroom/conference access credentials |
| `services` | Service offerings |
| `abouts` | About page content (singleton) |

---

## 🔌 API Endpoints Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Admin login → returns JWT |
| GET | `/api/auth/me` | ✅ | Verify token |

### Content (Public GET, Admin POST/PUT/DELETE)
| Resource | Base Path |
|----------|-----------|
| Blogs | `/api/blogs` |
| Projects | `/api/projects` |
| Announcements | `/api/announcements` |
| Media | `/api/media` |
| Team | `/api/team` |
| Services | `/api/services` |
| About | `/api/about` |
| Stats | `/api/stats` |

### Classroom & Security
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/credentials/verify` | ❌ | Verify gate credentials |
| GET | `/api/credentials` | ✅ | List all credentials |
| POST | `/api/credentials` | ✅ | Create credential |
| PUT | `/api/credentials/:id` | ✅ | Update/lock credential |
| DELETE | `/api/credentials/:id` | ✅ | Delete credential |

### Messages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/messages` | ❌ | Submit contact form |
| GET | `/api/messages` | ✅ | List all messages |
| PUT | `/api/messages/:id` | ✅ | Update status/response |

### WebRTC Signaling
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signal` | Relay peer signals |
| POST | `/api/pusher-auth` | Authenticate Pusher channels |

---

## 🔐 Admin Panel Usage

1. **Access**: Click the hidden admin link in the **About** page footer, or navigate to `/#admin`
2. **Login**: Username: `admin` | Password: set in `.env` → `ADMIN_PASSWORD`
3. **Dashboard tabs**: Home · About · Services · Team · Credentials · Blogs · Projects · Announcements · Media · Messages

**First login checklist:**
- [ ] Change admin password
- [ ] Add team members
- [ ] Add services
- [ ] Publish your first blog post
- [ ] Set up classroom credentials for students
- [ ] Update contact phone number in `index.html`

---

## ⚡ Live Classroom Setup (Pusher)

1. Create app at [pusher.com](https://pusher.com) → Channels → `ap2` cluster
2. Add Pusher keys to `.env` (backend) and `window._ENV` (frontend)
3. Students receive credentials from Admin → Credentials panel
4. Credentials are verified against MongoDB — no plain-text passwords stored
5. Each module (Classroom / Conference / Recordings) requires separate credentials

---

## 🔧 Environment Variables Quick Reference

```bash
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char-hex>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>

# For live classroom
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=ap2

# CORS
FRONTEND_URL=https://airaworld.org
```

---

## 🛠 Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env   # Fill in values
npm run dev            # Starts on http://localhost:3001

# Frontend
# Just open frontend/index.html in browser, or use Live Server (VS Code)
# The frontend auto-detects localhost and uses http://localhost:3001/api
```

---

## 📞 Support

- Website: [airaworld.org](https://airaworld.org)
- Email: info@airaworld.org
- Address: Kathmandu Metropolitan City, Bagmati Province, Nepal
