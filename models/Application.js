const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['applied', 'under_review', 'shortlisted', 'rejected', 'selected'],
        default: 'applied',
        index: true
    },
    appliedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Student information at time of application
    studentInfo: {
        enrollmentNumber: String,
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        department: String,
        semester: Number,
        tenthPercentage: Number,
        twelfthPercentage: Number,
        cgpa: Number
    },
    // Additional application details
    coverLetter: {
        type: String,
        maxlength: 2000
    },
    resumeUrl: {
        type: String
    },
    // Application tracking
    notes: {
        type: String,
        maxlength: 1000
    },
    // Admin can add comments
    adminNotes: {
        type: String,
        maxlength: 1000
    },
    // Interview details (if applicable)
    interviewScheduled: {
        type: Date
    },
    interviewLocation: {
        type: String
    },
    interviewNotes: {
        type: String,
        maxlength: 1000
    },
    // Final outcome
    finalOutcome: {
        type: String,
        enum: ['pending', 'selected', 'rejected', 'withdrawn']
    },
    outcomeDate: {
        type: Date
    },
    // Metadata
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'applications'
});

// Compound indexes for efficient queries
applicationSchema.index({ userId: 1, companyId: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ userId: 1, appliedAt: -1 });
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ status: 1, appliedAt: -1 });

// Virtual for application age
applicationSchema.virtual('applicationAge').get(function() {
    return Math.floor((Date.now() - this.appliedAt) / (1000 * 60 * 60 * 24)); // days
});

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);
