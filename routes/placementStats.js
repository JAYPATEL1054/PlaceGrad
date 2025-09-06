const express = require('express');
const { getCurrentStats, updateStats, getAllStats, createStats, deleteStats } = require('../controllers/placementStatsController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get current placement statistics (accessible to all authenticated users)
router.get('/current', auth, getCurrentStats);

// Get all placement statistics (admin only)
router.get('/all', auth, adminOnly, getAllStats);

// Create new placement statistics (admin only)
router.post('/', auth, adminOnly, createStats);

// Update placement statistics (admin only)
router.put('/:academicYear', auth, adminOnly, updateStats);

// Delete placement statistics (admin only)
router.delete('/:academicYear', auth, adminOnly, deleteStats);

module.exports = router;