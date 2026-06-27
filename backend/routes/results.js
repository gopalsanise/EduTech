const express = require('express');
const Result = require('../models/Result');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const { auth, authorize } = require('../middleware/auth');
const { validateRequired } = require('../utils/validation');
const router = express.Router();

// Enter marks (Staff/Teacher/Admin)
router.post('/', auth, authorize(['staff', 'teacher', 'admin']), async (req, res) => {
    try {
        const { student: studentId, semester, internalMarks, sessionalMarks, practicalMarks } = req.body;

        const missing = validateRequired(['student', 'semester'], req.body);
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing required field(s): ${missing.join(', ')}` });
        }

        const checkMarks = (m) => m === undefined || (m >= 0 && m <= 100);
        if (!checkMarks(internalMarks) || !checkMarks(sessionalMarks) || !checkMarks(practicalMarks)) {
            return res.status(400).send({ error: 'Marks must be between 0 and 100.' });
        }

        // If teacher, verify they are assigned to this semester
        if (req.user.role === 'teacher' || req.user.role === 'staff') {
            const faculty = await Faculty.findOne({ user: req.user._id });
            if (!faculty.assignedSemesters.includes(Number(semester))) {
                return res.status(403).send({ error: 'You can only upload marks for your assigned semesters.' });
            }
        }

        const totalMarks = (internalMarks || 0) + (sessionalMarks || 0) + (practicalMarks || 0);
        let grade = 'F';
        if (totalMarks >= 90) grade = 'A+';
        else if (totalMarks >= 80) grade = 'A';
        else if (totalMarks >= 70) grade = 'B';
        else if (totalMarks >= 60) grade = 'C';
        else if (totalMarks >= 50) grade = 'D';

        const resultStatus = totalMarks >= 40 ? 'Pass' : 'Fail';

        const result = new Result({
            student: studentId,
            semester,
            internalMarks,
            sessionalMarks,
            practicalMarks,
            totalMarks,
            grade,
            resultStatus,
            markedBy: {
                teacherId: req.user._id,
                teacherName: req.user.name
            }
        });

        await result.save();
        res.status(201).send(result);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Bulk Enter marks (Teacher/Admin)
router.post('/bulk', auth, authorize(['staff', 'teacher', 'admin']), async (req, res) => {
    try {
        const marksArray = req.body; // Array of result objects
        if (!Array.isArray(marksArray) || marksArray.length === 0) {
            return res.status(400).send({ error: 'Payload must be a non-empty array.' });
        }

        if (req.user.role === 'teacher' || req.user.role === 'staff') {
            const faculty = await Faculty.findOne({ user: req.user._id });
            const invalidSem = marksArray.some(m => !faculty.assignedSemesters.includes(Number(m.semester)));
            if (invalidSem) return res.status(403).send({ error: 'One or more records belong to an unassigned semester.' });
        }

        const results = await Promise.all(marksArray.map(async m => {
            const total = (m.internalMarks || 0) + (m.sessionalMarks || 0) + (m.practicalMarks || 0);
            let grade = 'F';
            if (total >= 90) grade = 'A+';
            else if (total >= 80) grade = 'A';
            else if (total >= 70) grade = 'B';
            else if (total >= 60) grade = 'C';
            else if (total >= 50) grade = 'D';

            return new Result({
                ...m,
                totalMarks: total,
                grade,
                resultStatus: total >= 40 ? 'Pass' : 'Fail',
                markedBy: {
                    teacherId: req.user._id,
                    teacherName: req.user.name
                }
            }).save();
        }));

        res.status(201).send(results);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Get results (Admin sees all, Teacher sees assigned, Student sees own)
router.get('/', auth, async (req, res) => {
    try {
        const { semester, branch, studentId } = req.query;
        let query = {};

        if (req.user.role === 'student') {
            const studentProfile = await Student.findOne({ user: req.user._id });
            query = { student: studentProfile._id };
        } else if (req.user.role === 'teacher' || req.user.role === 'staff') {
            const faculty = await Faculty.findOne({ user: req.user._id });
            query = { semester: { $in: faculty.assignedSemesters } };
        }

        if (semester) query.semester = semester;
        if (studentId) query.student = studentId;

        const results = await Result.find(query)
            .populate('student', 'rollNumber user')
            .sort({ createdAt: -1 });
        res.send(results);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

module.exports = router;
