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
        } else {
            // Update existing stats with current default values
            stats.totalCompaniesVisited = defaultStats.totalCompaniesVisited;
            stats.studentsPlaced = defaultStats.studentsPlaced;
            stats.highestPackage = defaultStats.highestPackage;
            stats.averagePackage = defaultStats.averagePackage;
            await stats.save();
            console.log('Updated existing stats with new default values');
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
            stats.totalCompaniesVisited = totalCompaniesVisited || stats.totalCompaniesVisited;
            stats.studentsPlaced = studentsPlaced || stats.studentsPlaced;
            stats.highestPackage = highestPackage || stats.highestPackage;
            stats.averagePackage = averagePackage || stats.averagePackage;
        }

        await stats.save();

        res.json({
            success: true,
            message: 'Placement statistics updated successfully',
            stats
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCurrentStats,
    updateStats
};