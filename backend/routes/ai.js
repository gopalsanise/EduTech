const express = require('express');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Predict student performance
router.get('/predict/:studentId', auth, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const [attendance, results] = await Promise.all([
            Attendance.find({ 'records.student': studentId }),
            Result.find({ student: studentId })
        ]);

        // Attendance Percentage
        const totalClasses = attendance.length;
        const presentClasses = attendance.filter(record =>
            record.records.some(r => r.student.toString() === studentId && r.status === 'Present')
        ).length;
        const attendanceRate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        // Academic Average
        const totalPossibleMarks = results.length * 100;
        const totalObtainedMarks = results.reduce((acc, r) => acc + (r.totalMarks || 0), 0);
        const academicRate = totalPossibleMarks > 0 ? (totalObtainedMarks / totalPossibleMarks) * 100 : 0;

        // Prediction Logic (Weights: Attendance 30%, Marks 70%)
        const predictedScore = (attendanceRate * 0.3) + (academicRate * 0.7);

        let riskLevel = 'Low';
        let tips = ['Keep up the good work!', 'Participate in more extracurriculars.'];

        if (predictedScore < 50) {
            riskLevel = 'High';
            tips = ['Focus on core subjects.', 'Increase attendance immediately.', 'Seek peer tutoring.'];
        } else if (predictedScore < 75) {
            riskLevel = 'Medium';
            tips = ['Solve previous year papers.', 'Improve attendance to above 75%.'];
        }

        res.send({
            attendanceRate: Math.round(attendanceRate),
            academicRate: Math.round(academicRate),
            predictedScore: Math.round(predictedScore),
            riskLevel,
            tips
        });
    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;
