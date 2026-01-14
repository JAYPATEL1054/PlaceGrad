const express = require('express');
const {
    login,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    register
} = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', register);

module.exports = router;