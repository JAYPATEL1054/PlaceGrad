const express = require('express');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const userRoutes = require('./user');
const companyRoutes = require('./company'); // Add this line

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/companies', companyRoutes); // Add this line

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'PlaceGrad API v1.0',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            admin: '/api/admin',
            user: '/api/user',
            companies: '/api/companies' // Add this line
        },
        documentation: 'Contact admin for API documentation'
    });
});

module.exports = router;