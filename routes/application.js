const express = require('express');
const {
    applyToCompany,
    getUserApplications,
    getAllApplications,
    updateApplicationStatus,
    getApplicationStats,
    getUserApplicationStatus
} = require('../controllers/applicationController');
const { auth, adminOnly, facultyOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Student routes - require authentication
router.post('/apply', auth, applyToCompany);
router.get('/my-applications', auth, getUserApplications);
router.get('/my-status', auth, getUserApplicationStatus);

// Admin/Faculty routes - require admin or faculty role
router.get('/all', auth, facultyOrAdmin, getAllApplications);
router.patch('/:applicationId/status', auth, adminOnly, updateApplicationStatus);
router.get('/stats', auth, adminOnly, getApplicationStats);

module.exports = router;
