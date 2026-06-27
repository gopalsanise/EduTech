const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { validatePhone, validateEmail, validateRequired } = require('../utils/validation');
const router = express.Router();

// Get current student profile
router.get('/me', auth, authorize(['student']), async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id })
            .populate('user', 'name email phone')
            .populate('branch', 'name code');
        if (!student) return res.status(404).send({ error: 'Student profile not found' });
        res.send(student);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Get all students (Admin/Teacher)
router.get('/', auth, authorize(['admin', 'teacher', 'staff']), async (req, res) => {
    try {
        const { semester, branch } = req.query;
        const query = {};
        if (semester) query.semester = semester;
        if (branch) query.branch = branch;

        const students = await Student.find(query)
            .populate('user', 'name email role')
            .populate('branch', 'name code');
        res.send(students);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Create student (Admin)
router.post('/', auth, authorize(['admin']), async (req, res) => {
    try {
        const requiredFields = ['name', 'email', 'rollNumber', 'branch', 'batch'];
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

        const existingStudent = await Student.findOne({ rollNumber: req.body.rollNumber });
        if (existingStudent) {
            return res.status(400).send({ error: 'Duplicate enrollment number detected. Please use a unique enrollment number.' });
        }

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password || 'Student@123',
            role: 'student',
            isVerified: true,
            isEmailVerified: true
        });
        await user.save();

        const student = new Student({
            ...req.body,
            user: user._id
        });
        await student.save();
        res.status(201).send(student);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Get student by ID (Admin/Teacher)
router.get('/:id', auth, authorize(['admin', 'teacher', 'staff']), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('user', 'name email phone role')
            .populate('branch', 'name code');
        if (!student) return res.status(404).send({ error: 'Student not found' });
        res.send(student);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Update student (Admin)
router.patch('/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        if (req.body.email && !validateEmail(req.body.email)) {
            return res.status(400).send({ error: 'Invalid email format.' });
        }
        if (req.body.phone && !validatePhone(req.body.phone)) {
            return res.status(400).send({ error: 'Invalid phone format (+91XXXXXXXXXX).' });
        }

        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!student) return res.status(404).send({ error: 'Student not found' });

        if (req.body.name || req.body.email || req.body.password) {
            const user = await User.findById(student.user);
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

                if (req.body.password) user.password = req.body.password;
                
                await user.save();
            }
        }
        res.send(student);
    } catch (e) {
        if (e.code === 11000) {
            const field = Object.keys(e.keyPattern || {}).join(', ') || 'field';
            if (field.includes('rollNumber')) {
                return res.status(400).send({ error: 'Duplicate enrollment number detected.' });
            }
            return res.status(400).send({ error: `Duplicate entry error: ${field} already exists.` });
        }
        res.status(400).send({ error: e.message });
    }
});


// Delete student (Admin)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).send({ error: 'Student not found' });

        // Also delete the linked User account
        const User = require('../models/User');
        await User.findByIdAndDelete(student.user);
        
        await Student.findByIdAndDelete(req.params.id);
        res.send({ message: 'Student and associated user account deleted successfully' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

module.exports = router;
