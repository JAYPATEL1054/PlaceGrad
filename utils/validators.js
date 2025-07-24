const validator = require('validator');

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

// Validate login input
const validateLoginInput = (username, password) => {
    const errors = [];

    // Check if username/email is provided
    if (!username || !username.trim()) {
        errors.push('Username or email is required');
    }

    // Check if password is provided
    if (!password) {
        errors.push('Password is required');
    }

    // Validate email format if it looks like an email
    if (username && username.includes('@') && !validator.isEmail(username)) {
        errors.push('Please enter a valid email address');
    }

    // Check username format if it's not an email
    if (username && !username.includes('@')) {
        if (username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validate registration input
const validateRegistrationInput = (username, email, password) => {
    const errors = [];

    // Username validation
    if (!username || !username.trim()) {
        errors.push('Username is required');
    } else {
        const cleanUsername = username.trim();
        if (cleanUsername.length < 3) {
            errors.push('Username must be at least 3 characters long');
        } else if (cleanUsername.length > 20) {
            errors.push('Username must be less than 20 characters');
        } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
    }

    // Email validation
    if (!email || !email.trim()) {
        errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else {
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        if (password.length > 128) {
            errors.push('Password must be less than 128 characters');
        }
        // Check for at least one number and one letter
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one letter and one number');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validate profile data
const validateProfileData = (profile) => {
    const errors = [];

    if (profile.firstName && profile.firstName.length > 50) {
        errors.push('First name must be less than 50 characters');
    }

    if (profile.lastName && profile.lastName.length > 50) {
        errors.push('Last name must be less than 50 characters');
    }

    if (profile.phone && profile.phone.length > 0) {
        // Basic phone validation - adjust regex based on your requirements
        if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(profile.phone)) {
            errors.push('Please enter a valid phone number');
        }
    }

    if (profile.semester && (profile.semester < 1 || profile.semester > 8)) {
        errors.push('Semester must be between 1 and 8');
    }

    if (profile.enrollmentNumber && profile.enrollmentNumber.length > 20) {
        errors.push('Enrollment number must be less than 20 characters');
    }

    if (profile.department && profile.department.length > 50) {
        errors.push('Department name must be less than 50 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Validate CSV data
const validateCSVRow = (row, rowIndex) => {
    const errors = [];
    const { username, email, password, role } = row;

    // Required fields
    if (!username) {
        errors.push(`Row ${rowIndex}: Username is required`);
    }
    if (!email) {
        errors.push(`Row ${rowIndex}: Email is required`);
    }
    if (!password) {
        errors.push(`Row ${rowIndex}: Password is required`);
    }

    // Validate individual fields
    if (username) {
        const usernameValidation = validateRegistrationInput(username, 'dummy@email.com', 'password123');
        if (!usernameValidation.isValid) {
            const usernameErrors = usernameValidation.errors.filter(err => err.includes('Username'));
            errors.push(...usernameErrors.map(err => `Row ${rowIndex}: ${err}`));
        }
    }

    if (email && !validator.isEmail(email)) {
        errors.push(`Row ${rowIndex}: Invalid email format`);
    }

    if (password && password.length < 6) {
        errors.push(`Row ${rowIndex}: Password must be at least 6 characters long`);
    }

    if (role && !['student', 'faculty', 'admin'].includes(role.toLowerCase())) {
        errors.push(`Row ${rowIndex}: Role must be student, faculty, or admin`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Check if string contains potentially malicious content
const containsMaliciousContent = (input) => {
    if (typeof input !== 'string') return false;
    
    const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /eval\(/i,
        /expression\(/i
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
};

// Validate file upload
const validateFileUpload = (file, allowedTypes, maxSize) => {
    const errors = [];

    if (!file) {
        errors.push('No file provided');
        return { isValid: false, errors };
    }

    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
        errors.push(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }

    // Check for malicious file names
    if (containsMaliciousContent(file.originalname)) {
        errors.push('File name contains invalid characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    sanitizeInput,
    validateLoginInput,
    validateRegistrationInput,
    validateProfileData,
    validateCSVRow,
    containsMaliciousContent,
    validateFileUpload
};