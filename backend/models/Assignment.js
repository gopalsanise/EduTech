const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    semester: { type: Number, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    submissions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fileUrl: String,
        submittedAt: { type: Date, default: Date.now },
        grade: String,
        feedback: String
    }],
    studyMaterial: [{
        title: String,
        url: String,
        type: { type: String, enum: ['PDF', 'Video', 'Notes'] }
    }]
});

module.exports = mongoose.model('Assignment', assignmentSchema);
