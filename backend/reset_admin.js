const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/collage_management_fresh').then(async () => {
    const newPassword = 'Admin@1234';
    const hashed = await bcrypt.hash(newPassword, 10);

    const result = await mongoose.connection.collection('users').updateOne(
        { role: 'admin' },
        { $set: { password: hashed } }
    );

    const admin = await mongoose.connection.collection('users').findOne({ role: 'admin' });

    if (result.modifiedCount > 0) {
        console.log('✅ Admin password reset successfully!');
        console.log('----------------------------------');
        console.log('📧 Email   :', admin.email);
        console.log('🔑 Password: Admin@1234');
        console.log('----------------------------------');
    } else {
        console.log('⚠️  No admin user found or already has this password.');
    }

    mongoose.disconnect();
}).catch(e => {
    console.error('❌ Error:', e.message);
    mongoose.disconnect();
});
