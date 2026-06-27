const express = require('express');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const { validateRequired } = require('../utils/validation');
const router = express.Router();

// Create announcement (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
    try {
        const requiredFields = ['title', 'content', 'type'];
        const missing = validateRequired(requiredFields, req.body);
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing required field(s): ${missing.join(', ')}` });
        }

        const notification = new Notification({
            ...req.body,
            createdBy: req.user._id
        });
        await notification.save();
        res.status(201).send(notification);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// Get notifications
router.get('/', auth, async (req, res) => {
    try {
        const query = { type: { $in: ['All', req.user.role === 'staff' ? 'Staff' : 'Student'] } };
        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        res.send(notifications);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;
