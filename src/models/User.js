const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        default: 'student'
    },
    profile: {
        firstName: String,
        lastName: String,
        enrollmentNumber: String,
        department: String,
        semester: Number,
        phone: String,
        // --- Academic fields ---
        tenthPercentage: {
            type: Number,
            min: 0,
            max: 100
        },
        tenthMarks: {
            obtainedMarks: { type: Number, min: 0 },
            totalMarks: { type: Number, min: 1 }
        },
        twelfthPercentage: {
            type: Number,
            min: 0,
            max: 100
        },
        cgpa: {
            type: Number,
            min: 0,
            max: 10
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    // OTP fields
    otp: String,
    otpExpires: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP method
userSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = otp;
    this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
