const express = require('express');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const userRoutes = require('./user');
const companyRoutes = require('./company');
const placementStatsRoutes = require('./placementStats');
const upcomingEventsRoutes = require('./upcomingEvents');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/companies', companyRoutes);
router.use('/placement-stats', placementStatsRoutes);
router.use('/upcoming-events', upcomingEventsRoutes);

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
            companies: '/api/companies',
            placementStats: '/api/placement-stats',
            upcomingEvents: '/api/upcoming-events'
        },
        documentation: 'Contact admin for API documentation'
    });
});

module.exports = router;