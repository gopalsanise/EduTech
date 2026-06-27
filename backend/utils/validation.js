const validatePhone = (phone) => {
    return /^\+91[0-9]{10}$/.test(phone);
};

const validatePassword = (password) => {
    if (!password) return false;
    const rules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#\$%\^&\*\(\),\.\?":\{\}\|<>_]/.test(password),
    };
    return Object.values(rules).every(Boolean);
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRequired = (fields, body) => {
    const missing = [];
    fields.forEach(field => {
        if (!body[field] || body[field].toString().trim() === '') {
            missing.push(field);
        }
    });
    return missing;
};

const validateRole = (role) => {
    return ['admin', 'teacher', 'student', 'staff'].includes(role);
};

module.exports = {
    validatePhone,
    validatePassword,
    validateEmail,
    validateRequired,
    validateRole,
};
