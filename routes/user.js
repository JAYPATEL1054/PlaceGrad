const express = require('express');
const {
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    toggleUserStatus
} = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Protected routes - require authentication
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);

// Admin only routes
router.get('/all', authenticateToken, authorizeRole('admin'), getAllUsers);
router.patch('/:userId/toggle-status', authenticateToken, authorizeRole('admin'), toggleUserStatus);

module.exports = router;