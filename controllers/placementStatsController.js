const PlacementStats = require('../models/PlacementStats');
const defaultStats = require('../config/defaultStats');

// Get current placement statistics
const getCurrentStats = async (req, res, next) => {
    console.log('Received request for current stats:', req.user);
    try {
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        console.log('Searching for academic year:', academicYear);
        let stats = await PlacementStats.findOne({ academicYear });
        console.log('Found stats:', stats);

        if (!stats) {
            console.log('Creating default stats for year:', academicYear);
            stats = await PlacementStats.create({
                academicYear,
                ...defaultStats
            });
        }

        console.log('Sending stats to client:', stats);
        res.json({
            success: true,
            stats
        });

    } catch (error) {
        next(error);
    }
};

// Update placement statistics (admin only)
const updateStats = async (req, res, next) => {
    try {
        const { academicYear } = req.params;
        const { totalCompaniesVisited, studentsPlaced, highestPackage, averagePackage } = req.body;

        console.log('Updating stats for academic year:', academicYear);
        console.log('Update data:', { totalCompaniesVisited, studentsPlaced, highestPackage, averagePackage });

        let stats = await PlacementStats.findOne({ academicYear });

        if (!stats) {
            stats = new PlacementStats({
                academicYear,
                totalCompaniesVisited,
                studentsPlaced,
                highestPackage,
                averagePackage
            });
        } else {
            stats.totalCompaniesVisited = totalCompaniesVisited !== undefined ? totalCompaniesVisited : stats.totalCompaniesVisited;
            stats.studentsPlaced = studentsPlaced !== undefined ? studentsPlaced : stats.studentsPlaced;
            stats.highestPackage = highestPackage !== undefined ? highestPackage : stats.highestPackage;
            stats.averagePackage = averagePackage !== undefined ? averagePackage : stats.averagePackage;
        }

        await stats.save();
        console.log('Stats updated successfully:', stats);

        res.json({
            success: true,
            message: 'Placement statistics updated successfully',
            stats
        });

    } catch (error) {
        next(error);
    }
};

// Get all placement statistics (admin only)
const getAllStats = async (req, res, next) => {
    try {
        const stats = await PlacementStats.find().sort({ academicYear: -1 });
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        next(error);
    }
};

// Create new placement statistics (admin only)
const createStats = async (req, res, next) => {
    try {
        const { academicYear, totalCompaniesVisited, studentsPlaced, highestPackage, averagePackage } = req.body;

        // Check if stats for this academic year already exist
        const existingStats = await PlacementStats.findOne({ academicYear });
        if (existingStats) {
            return res.status(400).json({
                success: false,
                message: 'Placement statistics for this academic year already exist'
            });
        }

        const stats = new PlacementStats({
            academicYear,
            totalCompaniesVisited,
            studentsPlaced,
            highestPackage,
            averagePackage
        });

        await stats.save();

        res.status(201).json({
            success: true,
            message: 'Placement statistics created successfully',
            stats
        });

    } catch (error) {
        next(error);
    }
};

// Delete placement statistics (admin only)
const deleteStats = async (req, res, next) => {
    try {
        const { academicYear } = req.params;

        const stats = await PlacementStats.findOneAndDelete({ academicYear });
        
        if (!stats) {
            return res.status(404).json({
                success: false,
                message: 'Placement statistics not found for this academic year'
            });
        }

        res.json({
            success: true,
            message: 'Placement statistics deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCurrentStats,
    updateStats,
    getAllStats,
    createStats,
    deleteStats
};