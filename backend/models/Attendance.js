const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        // Using String (YYYY-MM-DD) for easier unique indexing by date
    },
    semester: {
        type: Number,
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Leave'],
            default: 'Present'
        }
    }],
    markedBy: {
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        teacherName: {
            type: String,
            required: true
        }
    }
}, { timestamps: true });

// Prevent duplicate attendance: One student should have more than one attendance entry 
// for the same date in the same semester.
// Since we store all students for a session in one doc, we index by (date, semester, branch).
attendanceSchema.index({ date: 1, semester: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
