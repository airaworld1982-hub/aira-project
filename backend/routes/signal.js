// backend/routes/signal.js
// WebRTC Signaling via Pusher Channels
// POST /api/signal  — relay offer/answer/ICE between peers
// POST /api/pusher-auth  — authenticate Pusher presence channels

const express = require('express');
const Pusher  = require('pusher');

const router = express.Router();

let pusher = null;
if (process.env.PUSHER_APP_ID && process.env.PUSHER_APP_ID !== 'your_pusher_app_id') {
  pusher = new Pusher({
    appId:   process.env.PUSHER_APP_ID,
    key:     process.env.PUSHER_KEY,
    secret:  process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS:  true,
  });
}

// POST /api/signal  — relay signaling message to target peer
router.post('/', async (req, res) => {
  if (!pusher) {
    return res.status(503).json({ success: false, message: 'Pusher not configured' });
  }
  const { type, to, roomType, roomId, from, ...payload } = req.body;

  try {
    if (type === 'join') {
      // Broadcast to the room channel that a new peer joined
      await pusher.trigger(
        `aira-${roomType}-${roomId || 'aira-main'}`,
        'peer-joined',
        { socketId: from, ...payload }
      );
    } else if (type === 'offer' || type === 'answer' || type === 'ice') {
      // Send directly to the target peer's private channel
      await pusher.trigger(
        `aira-peer-${to}`,
        type,
        { from, ...payload }
      );
    } else if (type === 'leave') {
      await pusher.trigger(
        `aira-${roomType}-${roomId || 'aira-main'}`,
        'peer-left',
        { socketId: from }
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/pusher-auth  — authenticate Pusher channels
// Mounted at both /api/pusher-auth (root) and /api/signal/pusher-auth
const pusherAuthHandler = (req, res) => {
  if (!pusher) {
    return res.status(503).json({ success: false, message: 'Pusher not configured' });
  }
  const socketId    = req.body.socket_id;
  const channelName = req.body.channel_name;
  const authResponse = pusher.authorizeChannel(socketId, channelName);
  res.send(authResponse);
};
router.post('/pusher-auth', pusherAuthHandler);
router.post('/',            (req, res, next) => {
  // When mounted at /api/pusher-auth, handle root POST
  if (req.originalUrl === '/api/pusher-auth') return pusherAuthHandler(req, res);
  next();
});

module.exports = router;
