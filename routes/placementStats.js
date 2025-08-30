const express = require('express');
const { getCurrentStats, updateStats } = require('../controllers/placementStatsController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get current placement statistics (accessible to all authenticated users)
router.get('/current', auth, getCurrentStats);

// Update placement statistics (admin only)
router.put('/:academicYear', auth, adminOnly, updateStats);

module.exports = router;