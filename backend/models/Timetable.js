const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    schedule: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
        slots: [{
            startTime: String,
            endTime: String,
            sessionName: String,
            faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            room: String,
            type: { type: String, enum: ['Lecture', 'Lab'], default: 'Lecture' }
        }]
    }]
});

module.exports = mongoose.model('Timetable', timetableSchema);
