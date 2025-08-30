const mongoose = require('mongoose');
const defaultStats = require('../config/defaultStats');

const placementStatsSchema = new mongoose.Schema({
    academicYear: {
        type: String,
        required: true,
        unique: true
    },
    totalCompaniesVisited: {
        type: Number,
        default: defaultStats.totalCompaniesVisited
    },
    studentsPlaced: {
        type: Number,
        default: defaultStats.studentsPlaced
    },
    highestPackage: {
        type: Number,  // Stored in LPA
        default: defaultStats.highestPackage
    },
    averagePackage: {
        type: Number,  // Stored in LPA
        default: defaultStats.averagePackage
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
placementStatsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('PlacementStats', placementStatsSchema);