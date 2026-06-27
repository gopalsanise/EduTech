const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: Number, required: true },
    internalMarks: { type: Number, default: 0 },
    sessionalMarks: { type: Number, default: 0 },
    practicalMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, required: true },
    grade: { type: String, required: true },
    resultStatus: { type: String, enum: ['Pass', 'Fail'], required: true },
    markedBy: {
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        teacherName: { type: String }
    },
    publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
