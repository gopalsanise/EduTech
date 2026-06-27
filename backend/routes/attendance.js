const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { auth, authorize } = require('../middleware/auth');
const { validateRequired } = require('../utils/validation');
const router = express.Router();

// Mark Attendance (Staff/Teacher/Admin)
router.post('/', auth, authorize(['teacher', 'staff', 'admin']), async (req, res) => {
    try {
        const { date, records, semester, branch } = req.body;

        const missing = validateRequired(['date', 'records', 'semester', 'branch'], req.body);
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing required field(s): ${missing.join(', ')}` });
        }

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).send({ error: 'Attendance records must be a non-empty array.' });
        }

        // If teacher, verify they are assigned to this semester
        if (req.user.role === 'teacher' || req.user.role === 'staff') {
            const faculty = await Faculty.findOne({ user: req.user._id });
            if (!faculty || !faculty.assignedSemesters.includes(Number(semester))) {
                return res.status(403).send({ error: `You are only authorized to mark attendance for your assigned semesters.` });
            }
        }

        const attendance = new Attendance({
            date, // Expected format YYYY-MM-DD
            semester,
            branch,
            records,
            markedBy: {
                teacherId: req.user._id,
                teacherName: req.user.name
            }
        });

        await attendance.save();
        res.status(201).send(attendance);
    } catch (e) {
        // Handle duplicate entry (date + semester + branch)
        if (e.code === 11000) {
            return res.status(409).send({ error: `Attendance already marked for Semester ${req.body.semester} on ${req.body.date}.` });
        }
        res.status(400).send({ error: e.message });
    }
});

// Get Attendance Analytics Report
router.get('/report', auth, authorize(['admin', 'teacher', 'staff']), async (req, res) => {
    try {
        const { semester, branch, startDate, endDate } = req.query;
        let query = {};

        if (req.user.role === 'teacher' || req.user.role === 'staff') {
            const faculty = await Faculty.findOne({ user: req.user._id });
            if (!faculty) return res.status(404).send({ error: 'Faculty profile not found.' });
            
            if (semester) {
                if (!faculty.assignedSemesters.includes(Number(semester))) {
                    return res.status(403).send({ error: 'Not authorized for this semester.' });
                }
                query.semester = Number(semester);
            } else {
                query.semester = { $in: faculty.assignedSemesters };
            }
            if (faculty.branch) query.branch = faculty.branch;
        } else if (req.user.role === 'admin') {
            if (semester) query.semester = Number(semester);
            if (branch) query.branch = branch;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        const sessions = await Attendance.find(query).populate({
            path: 'records.student',
            select: 'rollNumber user',
            populate: {
                path: 'user',
                select: 'name'
            }
        });

        // Aggregate Data
        let totalSessions = sessions.length;
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLeave = 0;

        let dailyTrend = {};
        let studentStats = {};

        sessions.forEach(session => {
            // Daily Trend
            if (!dailyTrend[session.date]) {
                dailyTrend[session.date] = { present: 0, absent: 0, leave: 0 };
            }

            session.records.forEach(record => {
                if (record.status === 'Present') {
                    totalPresent++;
                    dailyTrend[session.date].present++;
                } else if (record.status === 'Absent') {
                    totalAbsent++;
                    dailyTrend[session.date].absent++;
                } else {
                    totalLeave++;
                    dailyTrend[session.date].leave++;
                }

                if (record.student) {
                    const sid = record.student._id.toString();
                    if (!studentStats[sid]) {
                        studentStats[sid] = {
                            student: record.student,
                            present: 0, absent: 0, leave: 0, total: 0
                        };
                    }
                    studentStats[sid].total++;
                    if (record.status === 'Present') studentStats[sid].present++;
                    if (record.status === 'Absent') studentStats[sid].absent++;
                    if (record.status === 'Leave') studentStats[sid].leave++;
                }
            });
        });

        // Calculate student percentages
        const topDefaulters = Object.values(studentStats)
            .map(s => ({
                ...s,
                percentage: s.total > 0 ? (s.present / s.total) * 100 : 0
            }))
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 10); // Top 10 lowest attendance

        // Sort Daily Trend
        const sortedDailyTrend = Object.keys(dailyTrend).sort().map(date => ({
            date,
            ...dailyTrend[date]
        }));

        res.send({
            overview: {
                totalSessions,
                totalPresent,
                totalAbsent,
                totalLeave,
                overallPercentage: (totalPresent + totalAbsent + totalLeave) > 0
                    ? (totalPresent / (totalPresent + totalAbsent + totalLeave)) * 100
                    : 0
            },
            dailyTrend: sortedDailyTrend,
            topDefaulters
        });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Get Attendance History
router.get('/', auth, async (req, res) => {
    try {
        const { semester, branch, studentId, startDate, endDate, date } = req.query;
        let query = {};

        // Role-based filtering
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id });
            if (!student) return res.status(404).send({ error: 'Student profile not found.' });
            query = { 'records.student': student._id };
        } else if (req.user.role === 'teacher' || req.user.role === 'staff') {
            const faculty = await Faculty.findOne({ user: req.user._id });
            if (!faculty) return res.status(404).send({ error: 'Faculty profile not found.' });
            query = { semester: { $in: faculty.assignedSemesters } };
            if (semester) query.semester = Number(semester);
        } else if (req.user.role === 'admin') {
            if (semester) query.semester = Number(semester);
            if (branch) query.branch = branch;
        }

        // Additional filters
        if (date) query.date = date;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }
        if (studentId) query['records.student'] = studentId;

        const attendance = await Attendance.find(query)
            .populate('branch', 'name code')
            .populate({
                path: 'records.student',
                select: 'rollNumber user',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            })
            .populate('markedBy.teacherId', 'name email')
            .sort({ date: -1, createdAt: -1 });

        // If student, simplify the response to show only their individual status
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id });
            const filtered = attendance.map(session => {
                const record = session.records.find(r => {
                    if (!r.student) return false;
                    const sId = r.student._id ? r.student._id.toString() : r.student.toString();
                    return sId === student._id.toString();
                });
                
                return {
                    date: session.date,
                    semester: session.semester,
                    status: record ? record.status : 'N/A',
                    markedBy: session.markedBy.teacherName,
                    timestamp: session.createdAt
                };
            }).filter(item => item.status !== 'N/A');

            // Ensure no duplicate records for same date, latest correct record is used (array is already sorted by date desc)
            const uniqueRecords = [];
            const seenDates = new Set();
            for (const item of filtered) {
                if (!seenDates.has(item.date)) {
                    seenDates.add(item.date);
                    uniqueRecords.push(item);
                }
            }

            return res.send(uniqueRecords);
        }

        res.send(attendance);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Update/Correct Attendance (Admin Only)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const { records } = req.body;
        if (!records) {
            return res.status(400).send({ error: 'Missing required fields (records).' });
        }

        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).send({ error: 'Attendance session not found.' });
        }

        // Replace records array
        attendance.records = records;
        await attendance.save();
        res.send(attendance);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

module.exports = router;
