const express = require('express');
const Assignment = require('../models/Assignment');
const { auth, authorize } = require('../middleware/auth');
const { validateRequired } = require('../utils/validation');
const router = express.Router();

// Create assignment or upload study material (Staff only)
router.post('/', auth, authorize(['staff']), async (req, res) => {
    try {
        const requiredFields = ['title', 'semester', 'type'];
        const missing = validateRequired(requiredFields, req.body);
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing required field(s): ${missing.join(', ')}` });
        }

        const assignment = new Assignment({
            ...req.body,
            faculty: req.user._id
        });
        await assignment.save();
        res.status(201).send(assignment);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// Get assignments (filtered by semester)
router.get('/', auth, async (req, res) => {
    try {
        const query = {};
        if (req.query.semester) query.semester = req.query.semester;
        
        const assignments = await Assignment.find(query).populate('faculty', 'name');
        res.send(assignments);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Submit assignment (Student only)
router.post('/:id/submit', auth, authorize(['student']), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).send();

        assignment.submissions.push({
            student: req.user._id,
            fileUrl: req.body.fileUrl
        });

        await assignment.save();
        res.send(assignment);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

module.exports = router;
