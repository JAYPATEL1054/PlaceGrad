const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');
const { validateLoginInput, validateRegistrationInput, sanitizeInput } = require('../utils/validators');

// Rate limiting for sensitive operations
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // limit each IP to 3 OTP requests per windowMs
    message: {
        success: false,
        message: 'Too many OTP requests, please try again later.'
    }
});

// JWT token generation utility
const generateToken = (payload, expiresIn = '24h') => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn });
};

// JWT token verification utility
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

// Mask email for security
const maskEmail = (email) => {
    if (!email || email.length < 3) return email;
    const [local, domain] = email.split('@');
    if (!domain) return email;
    
    if (local.length <= 2) {
        return `${local[0]}***@${domain}`;
    }
    return `${local.substring(0, 2)}***@${domain}`;
};

// Login handler
exports.login = async (req, res, next) => { 
    try {
        const { username, password, remember } = req.body;

        // Validate input
        const validation = validateLoginInput(username, password);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors[0],
                code: 'VALIDATION_ERROR'
            });
        }

        // Sanitize input
        const sanitizedUsername = sanitizeInput(username);

        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: sanitizedUsername },
                { email: sanitizedUsername.toLowerCase() }
            ]
        }).select('+password'); // Explicitly select password field

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Check for too many failed login attempts
        if (user.loginAttempts >= 5 && user.lockUntil && user.lockUntil > Date.now()) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
            return res.status(429).json({
                success: false,
                message: `Account temporarily locked. Try again in ${lockTimeRemaining} minutes.`,
                code: 'ACCOUNT_LOCKED'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            // Increment failed login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            
            // Lock account for 30 minutes after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
            }
            
            await user.save();
            
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Reset login attempts on successful password verification
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        // Generate and send OTP
        const otp = user.generateOTP();
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(user.email, otp, user.profile?.firstName || user.username);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.',
                code: 'EMAIL_SEND_ERROR'
            });
        }

        // Create temporary token for OTP verification
        const tempToken = generateToken({
            userId: user._id, 
            step: 'otp_verification',
            remember: !!remember,
            timestamp: Date.now()
        }, '15m');

        // Send response
        res.json({
            success: true,
            message: 'Login credentials verified. OTP sent to your email.',
            tempToken,
            email: maskEmail(user.email),
            requiresOTP: true,
            expiresIn: 15 * 60 // 15 minutes in seconds
        });

    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

// OTP verification handler
exports.verifyOTP = async (req, res, next) => {
    try {
        const { otp, tempToken } = req.body;

        // Validate input
        if (!otp || !tempToken) {
            return res.status(400).json({
                success: false,
                message: 'OTP and token are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate OTP format (should be 6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format',
                code: 'INVALID_OTP_FORMAT'
            });
        }

        // Verify temporary token
        let decoded;
        try {
            decoded = verifyToken(tempToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        if (decoded.step !== 'otp_verification') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type',
                code: 'INVALID_TOKEN_TYPE'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if user is still active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Check OTP
        if (!user.otp || user.otp !== otp) {
            // Increment OTP attempts
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            
            // Clear OTP after 3 failed attempts
            if (user.otpAttempts >= 3) {
                user.otp = undefined;
                user.otpExpires = undefined;
                user.otpAttempts = 0;
                await user.save();
                
                return res.status(401).json({
                    success: false,
                    message: 'Too many invalid OTP attempts. Please login again.',
                    code: 'OTP_ATTEMPTS_EXCEEDED'
                });
            }
            
            await user.save();
            
            return res.status(401).json({
                success: false,
                message: `Invalid OTP. ${3 - user.otpAttempts} attempts remaining.`,
                code: 'INVALID_OTP'
            });
        }

        // Check OTP expiration
        if (!user.otpExpires || user.otpExpires < new Date()) {
            // Clear expired OTP
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpAttempts = 0;
            await user.save();
            
            return res.status(401).json({
                success: false,
                message: 'OTP has expired. Please login again.',
                code: 'OTP_EXPIRED'
            });
        }

        // Clear OTP and update last login
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        user.isEmailVerified = true;
        user.lastLogin = new Date();
        user.loginAttempts = 0; // Reset login attempts on successful login
        user.lockUntil = undefined;
        
        await user.save();

        // Generate final JWT token
        const tokenExpiry = decoded.remember ? '30d' : '24h';
        const token = generateToken({
            userId: user._id, 
            username: user.username,
            role: user.role,
            loginTime: Date.now()
        }, tokenExpiry);

        // Send response with user data (excluding sensitive fields)
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile: user.profile,
            isEmailVerified: user.isEmailVerified,
            lastLogin: user.lastLogin
        };

        res.json({
            success: true,
            message: 'Login successful! Welcome to PlaceGrad.',
            user: userResponse,
            token,
            expiresIn: decoded.remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // seconds
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        next(error);
    }
};

// Resend OTP handler
exports.resendOTP = async (req, res, next) => {
    try {
        const { tempToken } = req.body;

        if (!tempToken) {
            return res.status(400).json({
                success: false,
                message: 'Token is required',
                code: 'MISSING_TOKEN'
            });
        }

        // Verify temporary token
        let decoded;
        try {
            decoded = verifyToken(tempToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        if (decoded.step !== 'otp_verification') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type',
                code: 'INVALID_TOKEN_TYPE'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Check if enough time has passed since last OTP (prevent spam)
        const lastOTPTime = user.otpGeneratedAt || 0;
        const timeSinceLastOTP = Date.now() - lastOTPTime;
        const minWaitTime = 60 * 1000; // 1 minute

        if (timeSinceLastOTP < minWaitTime) {
            const waitTimeRemaining = Math.ceil((minWaitTime - timeSinceLastOTP) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${waitTimeRemaining} seconds before requesting a new OTP.`,
                code: 'OTP_RATE_LIMITED'
            });
        }

        // Generate new OTP
        const otp = user.generateOTP();
        user.otpGeneratedAt = Date.now();
        user.otpAttempts = 0; // Reset attempts
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(user.email, otp, user.profile?.firstName || user.username);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.',
                code: 'EMAIL_SEND_ERROR'
            });
        }

        res.json({
            success: true,
            message: 'New OTP sent to your email.',
            email: maskEmail(user.email)
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        next(error);
    }
};

// Forgot password handler
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
                code: 'MISSING_EMAIL'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                code: 'INVALID_EMAIL_FORMAT'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Always return success for security (don't reveal if email exists)
        const successResponse = {
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link.'
        };

        if (!user) {
            return res.json(successResponse);
        }

        if (!user.isActive) {
            return res.json(successResponse);
        }

        // Check rate limiting for password reset requests
        const lastResetRequest = user.resetRequestedAt || 0;
        const timeSinceLastRequest = Date.now() - lastResetRequest;
        const minWaitTime = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastRequest < minWaitTime) {
            return res.json(successResponse); // Don't reveal rate limiting
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        user.resetRequestedAt = Date.now();
        await user.save();

        // Send reset email
        try {
            await sendPasswordResetEmail(user.email, resetToken, user.profile?.firstName || user.username);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Still return success to not reveal email sending issues
        }

        res.json(successResponse);

    } catch (error) {
        console.error('Forgot password error:', error);
        next(error);
    }
};

// Reset password handler
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long',
                code: 'WEAK_PASSWORD'
            });
        }

        // Additional password strength validation
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                code: 'WEAK_PASSWORD'
            });
        }

        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
                code: 'INVALID_RESET_TOKEN'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Update password and clear reset token
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.resetRequestedAt = undefined;
        user.loginAttempts = 0; // Reset login attempts
        user.lockUntil = undefined;
        user.passwordChangedAt = new Date();
        
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        next(error);
    }
};

// Registration handler
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, role, profile } = req.body;

        // Validate input
        const validation = validateRegistrationInput(username, email, password);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors[0],
                code: 'VALIDATION_ERROR'
            });
        }

        // Sanitize input
        const sanitizedUsername = sanitizeInput(username);
        const sanitizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { username: sanitizedUsername },
                { email: sanitizedEmail }
            ]
        });

        if (existingUser) {
            const field = existingUser.username === sanitizedUsername ? 'Username' : 'Email';
            return res.status(400).json({
                success: false,
                message: `${field} already exists`,
                code: 'USER_EXISTS'
            });
        }

        // Validate role
        const validRoles = ['student', 'faculty', 'admin'];
        const userRole = role && validRoles.includes(role) ? role : 'student';

        // Create new user
        const userData = {
            username: sanitizedUsername,
            email: sanitizedEmail,
            password: password,
            role: userRole,
            profile: profile || {},
            isActive: true,
            createdAt: new Date()
        };

        // For admin-created users, mark as email verified
        const isAdminCreated = req.user && req.user.role === 'admin';
        if (isAdminCreated) {
            userData.isEmailVerified = true;
        }

        const user = new User(userData);
        await user.save();

        // Prepare response (exclude sensitive data)
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile: user.profile,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: isAdminCreated 
                ? 'User created successfully by admin' 
                : 'User registered successfully. Please verify your email to complete registration.',
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                code: 'DUPLICATE_KEY'
            });
        }
        
        next(error);
    }
};

// Change password (for authenticated users)
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long',
                code: 'WEAK_PASSWORD'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password',
                code: 'SAME_PASSWORD'
            });
        }

        // Find user and include password field
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
                code: 'INVALID_CURRENT_PASSWORD'
            });
        }

        // Update password
        user.password = newPassword;
        user.passwordChangedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        next(error);
    }
};

// Logout handler (optional - mainly for token blacklisting if implemented)
exports.logout = async (req, res, next) => {
    try {
        // In a stateless JWT system, logout is typically handled client-side
        // by removing the token. However, you could implement token blacklisting here
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        next(error);
    }
};

// Export rate limiters for use in routes
exports.authLimiter = authLimiter;
exports.otpLimiter = otpLimiter;