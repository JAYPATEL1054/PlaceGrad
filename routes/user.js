const express = require('express');
const {
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    toggleUserStatus
} = require('../controllers/userController');
const { auth, adminOnly, facultyOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Protected routes - require authentication
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);

// Admin only routes
router.get('/all', auth, adminOnly, getAllUsers);
router.patch('/:userId/toggle-status', auth, adminOnly, toggleUserStatus);

module.exports = router;
