const express = require('express');
const { 
    getUpcomingEvents, 
    getAllEvents, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    toggleEventStatus 
} = require('../controllers/upcomingEventsController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get upcoming events (accessible to all authenticated users)
router.get('/', auth, getUpcomingEvents);

// Get all events for admin management (admin only)
router.get('/all', auth, adminOnly, getAllEvents);

// Create new upcoming event (admin only)
router.post('/', auth, adminOnly, createEvent);

// Update upcoming event (admin only)
router.put('/:eventId', auth, adminOnly, updateEvent);

// Delete upcoming event (admin only)
router.delete('/:eventId', auth, adminOnly, deleteEvent);

// Toggle event active status (admin only)
router.patch('/:eventId/toggle-status', auth, adminOnly, toggleEventStatus);

module.exports = router;
