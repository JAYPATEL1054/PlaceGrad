const express = require('express');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'PlaceGrad API v1.0',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            admin: '/api/admin'
        },
        documentation: 'Contact admin for API documentation'
    });
});

module.exports = router;