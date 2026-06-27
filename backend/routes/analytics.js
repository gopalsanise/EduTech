const express = require('express');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get system-wide analytics (Admin/Staff only)
router.get('/', auth, authorize(['admin', 'staff']), async (req, res) => {
    try {
        const [students, faculty, pendingFaculty, attendance, results, branchesCount] = await Promise.all([
            Student.find().populate('branch', 'name'),
            Faculty.countDocuments(),
            Faculty.countDocuments({ status: 'Pending' }),
            Attendance.countDocuments(),
            Result.find(),
            require('../models/Branch').countDocuments()
        ]);

        // Simple pass/fail ratio
        const totalResults = results.length;
        const passCount = results.filter(r => r.resultStatus === 'Pass').length;
        const passRatio = totalResults > 0 ? (passCount / totalResults) * 100 : 0;

        // Dept (Branch) distribution
        const deptStats = {};
        students.forEach(s => {
            const branchName = s.branch?.name || 'General';
            deptStats[branchName] = (deptStats[branchName] || 0) + 1;
        });

        res.send({
            totalStudents: students.length,
            totalFaculty: faculty,
            pendingFaculty,
            passRatio: Math.round(passRatio),
            deptStats,
            totalClasses: branchesCount
        });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

module.exports = router;
