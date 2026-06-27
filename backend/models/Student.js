const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    course: { type: String, required: false }, // e.g., B.Tech, M.Tech (Optional now)
    semester: { type: Number, default: 1 },
    section: { type: String }, // e.g., A, B
    batch: { type: String, required: true }, // e.g., 2022-2026
    rollNumber: { type: String, required: true, unique: true },
    uniqueStudentId: { type: String, unique: true },
    phone: { type: String, match: [/^\+91[0-9]{10}$/, 'Phone number must be exactly 10 digits starting with +91'] },
    dob: { type: Date, required: true },
    photo: { type: String }, // Student Photo (Base64 or URL)
    address: { type: String },
    status: {
        type: String,
        enum: ['Active', 'Suspended', 'Newly Registered', 'Inactive'],
        default: 'Newly Registered'
    },
    lastLogin: { type: Date },
    loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ip: String,
        userAgent: String
    }],
    documents: [{
        name: String,
        url: String
    }],
    isAlumni: { type: Boolean, default: false },
    academicHistory: [{
        semester: Number,
        sgpa: Number,
        results: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }]
    }]
}, { timestamps: true });

// Pre-save hook to generate uniqueStudentId if not present
studentSchema.pre('save', function () {
    if (!this.uniqueStudentId) {
        this.uniqueStudentId = 'STU' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
});

module.exports = mongoose.model('Student', studentSchema);
