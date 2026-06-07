# AIRA Deployment Checklist

## Before Going Live

### MongoDB Atlas
- [ ] Created free M0 cluster
- [ ] Created database user (username + password)
- [ ] Set Network Access to 0.0.0.0/0
- [ ] Copied connection string into .env → MONGODB_URI

### Environment Variables
- [ ] MONGODB_URI set
- [ ] JWT_SECRET changed to a random string (not the default)
- [ ] ADMIN_PASSWORD changed to a strong password
- [ ] FRONTEND_URL set to your live domain

### Pusher (for Live Classroom)
- [ ] Created Pusher account and app
- [ ] PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER set in .env
- [ ] PUSHER_KEY added to frontend/index.html via window._ENV

### After First Deploy
- [ ] Run seed script: node scripts/seed.js
- [ ] Log into admin panel and change password
- [ ] Add your real team members
- [ ] Add your real services
- [ ] Update phone number in frontend/index.html (search: +977-1-XXXXXXX)
- [ ] Replace /og-image.png with your real logo (for social sharing)
- [ ] Test contact form submission

### Security
- [ ] .env file is NOT committed to git
- [ ] Admin password is strong (not aira2025)
- [ ] MongoDB Atlas IP whitelist reviewed
- [ ] JWT_SECRET is a long random string

## API Endpoints Quick Test

Visit these URLs after deployment to verify the backend works:

| URL | Expected |
|-----|---------|
| /api/health | {"success":true,"status":"OK"} |
| /api/stats | {"success":true,"data":{...}} |
| /api/blogs | {"success":true,"data":[...]} |
| /api/team | {"success":true,"data":[...]} |
