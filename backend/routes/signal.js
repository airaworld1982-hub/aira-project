// backend/routes/signal.js
// ══════════════════════════════════════════════════════════════
// Pusher signaling — chat relay + classroom events
// Public channel "aira-classroom" handles:
//   client-join, client-here, client-leave, chat-msg
// ══════════════════════════════════════════════════════════════

const express = require('express');
const Pusher  = require('pusher');
const router  = express.Router();

// ── Init Pusher server SDK ─────────────────────────────────────
let pusher = null;
if (
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_APP_ID !== 'your_pusher_app_id'
) {
  pusher = new Pusher({
    appId:   process.env.PUSHER_APP_ID,
    key:     process.env.PUSHER_KEY,
    secret:  process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || 'ap2',
    useTLS:  true,
  });
  console.log('✅ Pusher initialized — cluster:', process.env.PUSHER_CLUSTER);
}

// ── POST /api/signal/chat ──────────────────────────────────────
// Relay a chat message to all subscribers of a channel
router.post('/chat', async (req, res) => {
  if (!pusher) return res.json({ success: true, mode: 'local' });
  const { channel = 'aira-classroom', name, msg } = req.body;
  if (!msg) return res.status(400).json({ success: false, message: 'msg required' });
  try {
    await pusher.trigger(channel, 'chat-msg', { name, msg, ts: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/signal/join ──────────────────────────────────────
// Announce a user joining a classroom session
router.post('/join', async (req, res) => {
  if (!pusher) return res.json({ success: true, mode: 'local' });
  const { channel = 'aira-classroom', id, name } = req.body;
  if (!id || !name) return res.status(400).json({ success: false, message: 'id and name required' });
  try {
    await pusher.trigger(channel, 'client-join', { id, name, ts: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/signal/leave ─────────────────────────────────────
// Announce a user leaving a classroom session
router.post('/leave', async (req, res) => {
  if (!pusher) return res.json({ success: true, mode: 'local' });
  const { channel = 'aira-classroom', id, name } = req.body;
  try {
    await pusher.trigger(channel, 'client-leave', { id, name, ts: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/signal/here ──────────────────────────────────────
// Heartbeat — announce still present in session
router.post('/here', async (req, res) => {
  if (!pusher) return res.json({ success: true, mode: 'local' });
  const { channel = 'aira-classroom', id, name } = req.body;
  try {
    await pusher.trigger(channel, 'client-here', { id, name, ts: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/signal ───────────────────────────────────────────
// Generic WebRTC signal relay (offer/answer/ICE for peer connections)
router.post('/', async (req, res) => {
  if (!pusher) return res.json({ success: true, mode: 'local' });
  const { type, to, from, roomType, roomId, ...payload } = req.body;
  try {
    if (type === 'join') {
      await pusher.trigger(`aira-${roomType || 'classroom'}-${roomId || 'main'}`, 'peer-joined', { from, ...payload });
    } else if (['offer','answer','ice'].includes(type)) {
      await pusher.trigger(`aira-peer-${to}`, type, { from, ...payload });
    } else if (type === 'leave') {
      await pusher.trigger(`aira-${roomType || 'classroom'}-${roomId || 'main'}`, 'peer-left', { from });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/pusher-auth ──────────────────────────────────────
// Authenticate private/presence Pusher channels (if needed later)
const pusherAuthHandler = (req, res) => {
  if (!pusher) return res.status(503).json({ success: false, message: 'Pusher not configured' });
  try {
    const auth = pusher.authorizeChannel(req.body.socket_id, req.body.channel_name);
    res.send(auth);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
router.post('/pusher-auth', pusherAuthHandler);

module.exports = router;
