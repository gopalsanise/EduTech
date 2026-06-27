const express = require('express');
const Timetable = require('../models/Timetable');
const { auth, authorize } = require('../middleware/auth');
const { validateRequired } = require('../utils/validation');
const router = express.Router();

// Get timetable
router.get('/', auth, async (req, res) => {
    try {
        const { department, semester } = req.query;
        const query = {};
        if (department) query.department = department;
        if (semester) query.semester = semester;

        const timetable = await Timetable.findOne(query).populate('schedule.slots.faculty');
        res.send(timetable);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Update timetable (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
    try {
        const requiredFields = ['department', 'semester', 'schedule'];
        const missing = validateRequired(requiredFields, req.body);
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing required field(s): ${missing.join(', ')}` });
        }

        const timetable = new Timetable(req.body);
        await timetable.save();
        res.status(201).send(timetable);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

module.exports = router;
