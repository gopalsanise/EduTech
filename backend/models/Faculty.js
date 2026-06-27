const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: false },
    employeeId: { type: String, unique: true },
    designation: { type: String, required: true },
    qualification: { type: String },
    education: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    dob: { type: Date },
    department: { type: String }, // For flexible grouping, can be same as branch name
    phone: { type: String, match: [/^\+91[0-9]{10}$/, 'Phone number must be 10 digits prefixed with +91 (e.g. +911234567890)'] },
    photo: { type: String }, // Faculty Photo (Base64 or URL)
    assignedSemesters: [{ type: Number, default: 1 }],
    workload: { type: Number, default: 0 }, // hours per week
    leaveRequests: [{
        startDate: Date,
        endDate: Date,
        reason: String,
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
    }],
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
