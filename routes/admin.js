const express = require('express');
const { auth } = require('../middleware/auth');  // ✅ FIXED: Destructure it!

const {
    getAllUsers,
    getUserById,
    toggleUserStatus,
    updateUser,
    deleteUser,
    getDashboardStats,
    createUser,
    searchUsers
} = require('../controllers/adminController');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(auth);

// Admin dashboard routes
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/search', searchUsers);
router.get('/users/:userId', getUserById);
router.post('/users', createUser);
router.put('/users/:userId', updateUser);
router.patch('/users/:userId/toggle-status', toggleUserStatus);
router.delete('/users/:userId', deleteUser);

module.exports = router;
