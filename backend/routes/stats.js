// backend/routes/stats.js
const express  = require('express');
const Blog     = require('../models/Blog');
const Project  = require('../models/Project');
const Team     = require('../models/Team');
const Message  = require('../models/Message');

const router = express.Router();

// GET /api/stats  — public (aggregate counts for hero + impact strip)
router.get('/', async (req, res) => {
  try {
    const [projects, team, messages] = await Promise.all([
      Project.countDocuments({ hidden: false }),
      Team.countDocuments(),
      Message.countDocuments(),
    ]);
    res.json({
      success: true,
      data: {
        projects,
        partners: 120,     // static — update via admin if needed
        countries: 15,     // static — update via admin if needed
        trained: 500,      // static — update via admin if needed
        team,
        messages,
        // Classroom / Conference live counts come from Pusher presence channels
        // Set these via Pusher webhooks if needed, or leave as — for demo
        cl_session_title:  null,
        cl_session_sub:    null,
        conf_session_title: null,
        conf_session_sub:   null,
        conf_live_count:   null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
