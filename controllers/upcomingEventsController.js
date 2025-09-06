const UpcomingEvents = require('../models/UpcomingEvents');

// Get all upcoming events (accessible to all authenticated users)
const getUpcomingEvents = async (req, res, next) => {
    try {
        const events = await UpcomingEvents.find({ isActive: true })
            .sort({ date: 1 })
            .limit(10); // Limit to next 10 events
        
        res.json({
            success: true,
            events
        });
    } catch (error) {
        next(error);
    }
};

// Get all events for admin management (admin only)
const getAllEvents = async (req, res, next) => {
    try {
        const events = await UpcomingEvents.find()
            .sort({ date: -1 });
        
        res.json({
            success: true,
            events
        });
    } catch (error) {
        next(error);
    }
};

// Create new upcoming event (admin only)
const createEvent = async (req, res, next) => {
    try {
        const { title, date, description, eventType, company, location } = req.body;

        const event = new UpcomingEvents({
            title,
            date: new Date(date),
            description,
            eventType,
            company,
            location
        });

        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event
        });

    } catch (error) {
        next(error);
    }
};

// Update upcoming event (admin only)
const updateEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const { title, date, description, eventType, company, location, isActive } = req.body;

        console.log('Updating event:', eventId);
        console.log('Update data:', { title, date, description, eventType, company, location, isActive });

        const event = await UpcomingEvents.findById(eventId);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        event.title = title !== undefined ? title : event.title;
        event.date = date !== undefined ? new Date(date) : event.date;
        event.description = description !== undefined ? description : event.description;
        event.eventType = eventType !== undefined ? eventType : event.eventType;
        event.company = company !== undefined ? company : event.company;
        event.location = location !== undefined ? location : event.location;
        event.isActive = isActive !== undefined ? isActive : event.isActive;

        await event.save();
        console.log('Event updated successfully:', event);

        res.json({
            success: true,
            message: 'Event updated successfully',
            event
        });

    } catch (error) {
        next(error);
    }
};

// Delete upcoming event (admin only)
const deleteEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        const event = await UpcomingEvents.findByIdAndDelete(eventId);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// Toggle event active status (admin only)
const toggleEventStatus = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        const event = await UpcomingEvents.findById(eventId);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        event.isActive = !event.isActive;
        await event.save();

        res.json({
            success: true,
            message: `Event ${event.isActive ? 'activated' : 'deactivated'} successfully`,
            event
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUpcomingEvents,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus
};
