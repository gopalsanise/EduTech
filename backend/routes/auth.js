const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { validatePhone, validatePassword, validateEmail, validateRequired, validateRole } = require('../utils/validation');
const { generateOTP, sendOTP } = require('../utils/otp');
const bcrypt = require('bcryptjs');

// Student Signup STEP 1: Verify Identity via DOB
router.post('/student-verify-identity', async (req, res) => {
    try {
        const { enrollmentNumber, dob } = req.body;
        const missing = validateRequired(['enrollmentNumber', 'dob'], req.body);
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing required field(s): ${missing.join(', ')}` });
        }

        const Student = require('../models/Student');
        const student = await Student.findOne({ rollNumber: enrollmentNumber }).populate('user');
        if (!student) {
            return res.status(404).send({ error: 'Enrollment number not found. Please contact Admin.' });
        }

        // Verify DOB
        const storedDob = student.dob ? new Date(student.dob).toISOString().split('T')[0] : null;
        const providedDob = new Date(dob).toISOString().split('T')[0];

        if (!storedDob || storedDob !== providedDob) {
            return res.status(400).send({ error: 'Date of Birth does not match our records.' });
        }

        let userStatus = 'NotRegistered';
        let userId = null;
        let mobile = student.phone ? student.phone.replace('+91', '') : '';

        if (student.user) {
            userId = student.user._id;
            if (student.user.isActive) userStatus = 'Active';
            else if (student.user.isVerified) userStatus = 'Verified_PendingPassword';
        } else {
            const User = require('../models/User');
            const user = new User({
                name: student.name || 'Student',
                email: student.email || `stu_${enrollmentNumber}@college.edu`,
                mobile: mobile,
                password: 'UNSET_' + Date.now(),
                role: 'student',
                isActive: false,
                isVerified: false
            });
            await user.save();
            student.user = user._id;
            await student.save();
            userId = user._id;
        }

        res.status(200).send({ 
            message: 'Identity verified.',
            status: userStatus,
            userId,
            mobile,
            redirect: userStatus === 'NotRegistered' ? '/create-password' : null
        });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Teacher: Submit Application (No Verification)
router.post('/apply-teacher', async (req, res) => {
    try {
        let { name, email, phone, department, qualification, education, fatherName, motherName, dob } = req.body;

        // Normalize phone number: ensure it starts with +91 and has 10 digits
        if (phone) {
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 10) {
                phone = `+91${digits}`;
            }
        }

        const requiredFields = ['name', 'email', 'phone', 'department', 'qualification', 'education', 'fatherName', 'motherName', 'dob'];
        const missing = validateRequired(requiredFields, { ...req.body, phone });
        if (missing.length > 0) {
            return res.status(400).send({ error: `Missing field(s): ${missing.join(', ')}` });
        }

        if (!validateEmail(email)) {
            return res.status(400).send({ error: 'Invalid email address.' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send({ error: 'This email is already registered.' });
        }

        user = new User({
            name,
            email,
            mobile: phone ? phone.replace('+91', '') : '',
            role: 'teacher',
            isActive: false,
            isVerified: false,
            isEmailVerified: true, // Verification removed as per requirement
            password: 'UNSET_' + Date.now() // Placeholder
        });
        await user.save();

        try {
            const Faculty = require('../models/Faculty');
            const faculty = new Faculty({
                user: user._id,
                employeeId: `FAC-APP-${Math.floor(1000 + Math.random() * 9000)}`,
                designation: 'Assistant Professor', // Default designation for applicants
                department,
                qualification,
                education,
                fatherName,
                motherName,
                dob: new Date(dob),
                phone,
                status: 'Pending'
            });
            await faculty.save();
        } catch (facultyError) {
            // Cleanup: if Faculty record fails, delete the created User record
            await User.findByIdAndDelete(user._id);
            throw facultyError;
        }

        res.status(201).send({ 
            message: 'Application submitted successfully! Waiting for admin approval.',
            status: 'Pending'
        });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Admin: Approve/Reject Teacher Application
router.post('/admin/faculty/:id/:action', async (req, res) => {
    try {
        const { id, action } = req.params;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).send({ error: 'Invalid action.' });
        }

        const Faculty = require('../models/Faculty');
        const faculty = await Faculty.findById(id).populate('user');
        if (!faculty) {
            return res.status(404).send({ error: 'Faculty application not found.' });
        }

        faculty.status = action === 'approve' ? 'Approved' : 'Rejected';
        await faculty.save();

        res.status(200).send({ message: `Application ${faculty.status} successfully.` });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Unified CREATE PASSWORD (for both Students and Approved Teachers)
router.post('/create-password', async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!password || !validatePassword(password)) {
            return res.status(400).send({ error: 'Password does not meet security requirements. (Min 8 characters, Upper, Lower, Number, Special)' });
        }

        const User = require('../models/User');
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).send({ error: 'User not found.' });

        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        user.isActive = true;
        user.isVerified = true;
        user.passwordUpdatedAt = new Date();
        await user.save();

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        res.status(201).send({ success: true, message: 'Password created', token, user });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, enrollmentNumber, password, portal } = req.body;
        
        if (!password) {
            return res.status(400).send({ error: 'Password is required' });
        }
        if (!email && !enrollmentNumber) {
            return res.status(400).send({ error: 'Email or Enrollment Number is required' });
        }

        const user = await User.findByCredentials(email, password, enrollmentNumber, portal);

        // ROLE AND PORTAL CHECK
        if (portal) {
            if (portal === 'admin' && user.role !== 'admin') {
                return res.status(403).send({ error: 'Access denied. Admin portal restricted.' });
            }
            if (portal === 'teacher' && user.role !== 'teacher') {
                return res.status(403).send({ error: 'Access denied. Staff portal restricted.' });
            }
            if (portal === 'student' && user.role !== 'student') {
                return res.status(403).send({ error: 'Access denied. Student portal restricted.' });
            }
        }

        // Check if user account is active & status is approved
        if (user.role !== 'admin') {
            if (!user.isActive) {
                return res.status(403).send({ error: 'Account is not active. Please complete identity verification or set your password.' });
            }
            
            if (user.role === 'teacher') {
                const Faculty = require('../models/Faculty');
                const faculty = await Faculty.findOne({ user: user._id });
                if (!faculty || faculty.status !== 'Approved') {
                    const statusMsg = faculty ? faculty.status : 'Pending';
                    return res.status(403).send({ error: `Your application is ${statusMsg}. Please await Admin approval.` });
                }
            }
        }

        // STUDENT LOGIN 
        if (user.role === 'student') {
            const Student = require('../models/Student');
            let student = await Student.findOne({ user: user._id });

            if (student) {
                student.lastLogin = new Date();
                student.loginHistory.push({
                    timestamp: new Date(),
                    userAgent: req.headers['user-agent']
                });
                if (student.status === 'Newly Registered' && student.loginHistory.length > 1) {
                    student.status = 'Active';
                }
                await student.save();
            }
        }

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Teacher: Check Status
router.post('/teacher-status', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).send({ error: 'Email is required.' });

        const user = await User.findOne({ email, role: 'teacher' });
        if (!user) {
            return res.status(404).send({ error: 'No application found with this email.' });
        }

        const Faculty = require('../models/Faculty');
        const faculty = await Faculty.findOne({ user: user._id });

        if (!faculty) {
            return res.status(404).send({ error: 'Faculty profile missing.' });
        }

        let statusResponse = {
            status: faculty.status,
            message: ''
        };

        if (faculty.status === 'Pending') {
            statusResponse.message = 'Waiting for admin approval';
        } else if (faculty.status === 'Approved') {
            statusResponse.message = 'Application approved! You can now create your password.';
            statusResponse.redirect = '/create-password';
            statusResponse.userId = user._id;
            statusResponse.mobile = user.mobile;
        } else if (faculty.status === 'Rejected') {
            statusResponse.message = 'Application rejected';
        }

        res.status(200).send(statusResponse);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// --- OTP ROUTES ---

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { userId, mobile } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.json({ success: false, message: "User not found" });

    // Update user mobile if provided (for first time verification if mobile was missing)
    if (mobile) user.mobile = mobile;

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    const sent = await sendOTP(user.mobile, otp);

    if (!sent) return res.json({ success: false, message: "OTP failed" });

    res.json({ success: true, message: "OTP sent" });
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user || user.otp !== otp)
        return res.json({ success: false, message: "Invalid OTP" });

    if (Date.now() > user.otpExpiry)
        return res.json({ success: false, message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ success: true, message: "Verified" });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.json({ success: false, message: "User not found" });
    if (!user.mobile) return res.json({ success: false, message: "No registered mobile for this user." });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    const sent = await sendOTP(user.mobile, otp);
    if (!sent) return res.json({ success: false, message: "OTP failed" });

    res.json({ success: true, userId: user._id, mobile: user.mobile });
});

// Reset Password (and Change Password)
router.post('/reset-password', async (req, res) => {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user || user.otp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (Date.now() > user.otpExpiry) return res.json({ success: false, message: "OTP expired" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;
    user.isActive = true;

    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
});

module.exports = router;
