const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student'],
        default: 'student'
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    passwordUpdatedAt: { type: Date },
    photo: { type: String }, // User Profile Photo (Base64 or URL)
    mobile: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
    avatar: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.statics.findByCredentials = async function (email, password, enrollmentNumber = null, portal = null) {
    let user;
    
    if (portal === 'student' && enrollmentNumber) {
        const Student = require('./Student');
        const student = await Student.findOne({ rollNumber: enrollmentNumber }).populate('user');
        if (!student || !student.user) throw new Error('Invalid enrollment number or account not activated.');
        user = student.user;
    } else {
        user = await this.findOne({ email });
    }

    if (!user) throw new Error('Unable to login. User not found.');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials.');

    return user;
};
// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
