const express = require('express');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { validatePhone, validateEmail, validateRequired } = require('../utils/validation');
const router = express.Router();

// Get current faculty profile
router.get('/me', auth, authorize(['teacher', 'staff']), async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id })
            .populate('branch', 'name code');
        if (!faculty) return res.status(404).send({ error: 'Faculty profile not found' });
        res.send(faculty);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Get all faculty (Admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
    try {
        const faculty = await Faculty.find({})
            .populate('user', 'name email role')
            .populate('branch', 'name code');
        res.send(faculty);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Get students for assigned semester (Teacher only)
router.get('/my-students', auth, authorize(['teacher', 'staff']), async (req, res) => {
    try {
        const { semester } = req.query;
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) return res.status(404).send({ error: 'Faculty profile not found' });

        const selectedSemester = semester ? Number(semester) : faculty.assignedSemesters[0];

        if (!faculty.assignedSemesters.includes(selectedSemester)) {
            return res.status(403).send({ error: 'You are not assigned to this semester' });
        }

        const students = await Student.find({
            semester: selectedSemester,
            branch: faculty.branch
        }).populate('user', 'name email phone');

        res.send(students);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Create Faculty (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
    try {
        const requiredFields = ['name', 'email', 'designation'];
        const missing = validateRequired(requiredFields, req.body);
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing field(s): ${missing.join(', ')}` });
        }

        if (!validateEmail(req.body.email)) {
            return res.status(400).send({ error: 'Invalid email format.' });
        }

        if (req.body.phone && !validatePhone(req.body.phone)) {
            return res.status(400).send({ error: 'Invalid phone format (+91XXXXXXXXXX).' });
        }

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password || 'Faculty@123',
            role: 'teacher',
            isActive: !!req.body.password,
            isVerified: true,
            isEmailVerified: true
        });
        await user.save();

        const faculty = new Faculty({
            ...req.body,
            user: user._id
        });
        await faculty.save();
        res.status(201).send(faculty);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Update Faculty
router.patch('/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        if (req.body.email && !validateEmail(req.body.email)) {
            return res.status(400).send({ error: 'Invalid email format.' });
        }

        if (req.body.phone && !validatePhone(req.body.phone)) {
            return res.status(400).send({ error: 'Invalid phone format (+91XXXXXXXXXX).' });
        }

        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).send({ error: 'Faculty not found' });

        const oldStatus = faculty.status;

        Object.assign(faculty, req.body);
        await faculty.save();

        if (req.body.name || req.body.email || req.body.password || (req.body.status === 'Approved' && oldStatus !== 'Approved')) {
            const user = await User.findById(faculty.user);
            if (user) {
                if (req.body.name) user.name = req.body.name;
                
                // Only update email if it's different and handle potential duplicates
                if (req.body.email && req.body.email !== user.email) {
                    const existingUser = await User.findOne({ email: req.body.email });
                    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                        return res.status(400).send({ error: 'This email is already in use by another user.' });
                    }
                    user.email = req.body.email;
                }

                if (req.body.password) {
                    user.password = req.body.password;
                    user.isActive = true;
                }

                await user.save();
            }
        }

        res.send(faculty);
    } catch (e) {
        if (e.code === 11000) {
            const field = Object.keys(e.keyPattern || {}).join(', ') || 'field';
            return res.status(400).send({ error: `Duplicate entry error: ${field} already exists.` });
        }
        res.status(400).send({ error: e.message });
    }
});

// Delete Faculty (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).send({ error: 'Faculty not found' });

        const User = require('../models/User');
        await User.findByIdAndDelete(faculty.user);
        
        await Faculty.findByIdAndDelete(req.params.id);
        res.send({ message: 'Faculty and associated user account deleted successfully' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

module.exports = router;
