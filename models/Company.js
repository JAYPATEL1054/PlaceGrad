const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    industry: {
        type: String,
        required: true,
        trim: true
    },
    visitDate: {
        type: Date,
        required: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    package: {
        type: String,
        required: true,
        trim: true
    },
    eligibility: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    logoUrl: {
        type: String,
        default: function() {
            return `https://logo.clearbit.com/${this.name.toLowerCase().replace(/\s+/g, '')}.com`;
        }
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
companySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Company', companySchema);