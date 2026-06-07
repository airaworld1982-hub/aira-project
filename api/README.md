# /api folder

This folder is the **Vercel Serverless entry point**.

## What it does

`api/index.js` imports the full Express app from `backend/server.js`
and exports it so Vercel can run it as a serverless function.

## How requests flow

```
Browser request
      ↓
 vercel.json routes
      ↓
  /api/index.js          ← Vercel calls this file
      ↓
 backend/server.js       ← Full Express app
      ↓
 backend/routes/*.js     ← Individual route handlers
      ↓
 backend/models/*.js     ← MongoDB models
      ↓
 MongoDB Atlas           ← Database
```

## For local development

You do NOT use this folder locally.
The frontend talks directly to `http://localhost:3001`
which is started by `npm run dev` inside the `backend/` folder.

## For Vercel deployment

Vercel automatically detects `api/index.js` and deploys it
as a serverless function. All `/api/*` routes are handled by it.
You do not need to do anything extra — just deploy with `vercel`.
