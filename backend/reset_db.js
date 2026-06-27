const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Attendance = require('./models/Attendance');
const Result = require('./models/Result');
const Assignment = require('./models/Assignment');
const Timetable = require('./models/Timetable');
const Branch = require('./models/Branch');

const MONGO_URI = 'mongodb://localhost:27017/collage_management_fresh';

async function resetDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB. Starting database reset...');

        // 1. Delete all Attendance, Result, Assignment, Timetable records
        await Attendance.deleteMany({});
        console.log('Deleted all Attendance records.');

        await Result.deleteMany({});
        console.log('Deleted all Result records.');

        await Assignment.deleteMany({});
        console.log('Deleted all Assignment records.');

        await Timetable.deleteMany({});
        console.log('Deleted all Timetable records.');

        // 2. Delete all Students and Teachers
        await Student.deleteMany({});
        console.log('Deleted all Student records.');

        await Faculty.deleteMany({});
        console.log('Deleted all Faculty records.');

        // 3. Delete all Users except Admin
        const result = await User.deleteMany({ role: { $ne: 'admin' } });
        console.log(`Deleted ${result.deletedCount} non-admin User accounts.`);

        console.log('\nDatabase reset complete. All student and teacher data has been wiped.');
        process.exit(0);
    } catch (err) {
        console.error('Reset error:', err);
        process.exit(1);
    }
}

resetDB();
