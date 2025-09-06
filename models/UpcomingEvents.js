const mongoose = require('mongoose');

const upcomingEventsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    eventType: {
        type: String,
        enum: ['Pre-Placement Talk', 'Workshop', 'Mock Interview', 'Recruitment Drive', 'Training Session', 'Other'],
        default: 'Other'
    },
    company: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
upcomingEventsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient querying by date and active status
upcomingEventsSchema.index({ date: 1, isActive: 1 });

module.exports = mongoose.model('UpcomingEvents', upcomingEventsSchema);
