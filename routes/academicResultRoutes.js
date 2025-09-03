const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Import the Academic Result model
const AcademicResult = require('../models/AcademicResult');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// POST /api/academic-results - Save extracted academic result
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            username,
            resultType, // 'tenth' or 'twelfth'
            obtainedMarks,
            totalMarks,
            percentage,
            extractedAt,
            metadata,
            notes
        } = req.body;

        // Validation
        if (!username || !resultType || obtainedMarks === undefined || totalMarks === undefined || percentage === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: username, resultType, obtainedMarks, totalMarks, percentage'
            });
        }

        if (!['tenth', 'twelfth'].includes(resultType)) {
            return res.status(400).json({
                success: false,
                message: 'resultType must be either "tenth" or "twelfth"'
            });
        }

        // Validate numeric values
        if (isNaN(obtainedMarks) || isNaN(totalMarks) || isNaN(percentage)) {
            return res.status(400).json({
                success: false,
                message: 'obtainedMarks, totalMarks, and percentage must be valid numbers'
            });
        }

        // Additional validations
        if (parseInt(obtainedMarks) > parseInt(totalMarks)) {
            return res.status(400).json({
                success: false,
                message: 'Obtained marks cannot exceed total marks'
            });
        }

        if (parseFloat(percentage) > 100 || parseFloat(percentage) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Percentage must be between 0 and 100'
            });
        }

        // Check if user is authorized to save this data
        if (req.user.username !== username && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only save your own results'
            });
        }

        // Create academic result data
        const academicResultData = {
            username,
            resultType,
            obtainedMarks: parseInt(obtainedMarks),
            totalMarks: parseInt(totalMarks),
            percentage: parseFloat(percentage),
            extractedAt: extractedAt ? new Date(extractedAt) : new Date(),
            createdAt: new Date()
        };

        // Add metadata if provided
        if (metadata) {
            academicResultData.metadata = {
                extractionSource: metadata.extractionSource || 'ocr',
                documentType: metadata.documentType || 'unknown',
                confidence: metadata.confidence || 0.8,
                originalFilename: metadata.originalFilename,
                processingTime: metadata.processingTime,
                ocrEngine: metadata.ocrEngine || 'tesseract'
            };
        }

        // Add notes if provided
        if (notes) {
            academicResultData.notes = notes;
        }

        // Create new academic result
        const academicResult = new AcademicResult(academicResultData);

        // Save to MongoDB
        const savedResult = await academicResult.save();

        res.status(201).json({
            success: true,
            message: `${resultType} academic result saved successfully`,
            data: savedResult.getFormattedResult()
        });

    } catch (error) {
        console.error('Error saving academic result:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate entry detected'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to save academic result',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/academic-results/:username - Get user's academic results
router.get('/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        const { resultType, limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Check if user is requesting their own data or is admin
        if (req.user.username !== username && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only view your own results'
            });
        }

        // Build query
        const query = { username };
        if (resultType && ['tenth', 'twelfth'].includes(resultType)) {
            query.resultType = resultType;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortQuery = { [sortBy]: sortDirection };

        // Get results with pagination
        const results = await AcademicResult.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        // Get total count for pagination
        const totalCount = await AcademicResult.countDocuments(query);

        res.json({
            success: true,
            data: results.map(result => result.getFormattedResult()),
            pagination: {
                current: parseInt(page),
                total: Math.ceil(totalCount / parseInt(limit)),
                count: results.length,
                totalRecords: totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching academic results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch academic results',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/academic-results - Get all academic results (admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin privileges required'
            });
        }

        const { 
            page = 1, 
            limit = 50, 
            resultType, 
            username, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            startDate,
            endDate,
            verified
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        let query = {};
        
        if (resultType && ['tenth', 'twelfth'].includes(resultType)) {
            query.resultType = resultType;
        }
        
        if (username) {
            query.username = { $regex: username, $options: 'i' };
        }
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (verified !== undefined) {
            query.isVerified = verified === 'true';
        }

        // Sort configuration
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortQuery = { [sortBy]: sortDirection };

        // Get results
        const results = await AcademicResult.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await AcademicResult.countDocuments(query);

        res.json({
            success: true,
            data: results.map(result => result.getFormattedResult()),
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                count: results.length,
                totalRecords: total
            }
        });

    } catch (error) {
        console.error('Error fetching all academic results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch academic results',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/academic-results/latest/:username - Get user's latest results
router.get('/latest/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        
        // Check authorization
        if (req.user.username !== username && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only view your own results'
            });
        }

        const latestResults = await AcademicResult.getLatestResults(username);

        res.json({
            success: true,
            data: {
                tenth: latestResults.tenth ? latestResults.tenth.getFormattedResult() : null,
                twelfth: latestResults.twelfth ? latestResults.twelfth.getFormattedResult() : null
            }
        });

    } catch (error) {
        console.error('Error fetching latest results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch latest results',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/academic-results/:id - Update specific result (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin privileges required'
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;

        // If verification status is being updated, add verification details
        if (updateData.isVerified !== undefined) {
            updateData.verifiedBy = req.user.username;
            updateData.verifiedAt = new Date();
        }

        const updatedResult = await AcademicResult.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedResult) {
            return res.status(404).json({
                success: false,
                message: 'Academic result not found'
            });
        }

        res.json({
            success: true,
            message: 'Academic result updated successfully',
            data: updatedResult.getFormattedResult()
        });

    } catch (error) {
        console.error('Error updating academic result:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update academic result',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/academic-results/:id - Delete specific result (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin privileges required'
            });
        }

        const { id } = req.params;
        const deletedResult = await AcademicResult.findByIdAndDelete(id);

        if (!deletedResult) {
            return res.status(404).json({
                success: false,
                message: 'Academic result not found'
            });
        }

        res.json({
            success: true,
            message: 'Academic result deleted successfully',
            data: {
                id: deletedResult._id,
                username: deletedResult.username,
                resultType: deletedResult.resultType,
                percentage: deletedResult.percentage
            }
        });

    } catch (error) {
        console.error('Error deleting academic result:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete academic result',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/academic-results/statistics/overview - Get statistics overview (admin only)
router.get('/statistics/overview', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin privileges required'
            });
        }

        const { resultType } = req.query;
        const statistics = await AcademicResult.getStatistics(resultType);

        // Get additional metrics
        const totalResults = await AcademicResult.countDocuments();
        const verifiedResults = await AcademicResult.countDocuments({ isVerified: true });
        const recentResults = await AcademicResult.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        });

        res.json({
            success: true,
            data: {
                statistics,
                overview: {
                    totalResults,
                    verifiedResults,
                    recentResults,
                    verificationRate: totalResults > 0 ? ((verifiedResults / totalResults) * 100).toFixed(2) : 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/academic-results/:id/verify - Verify a result (admin only)
router.post('/:id/verify', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin privileges required'
            });
        }

        const { id } = req.params;
        const { notes } = req.body;

        const result = await AcademicResult.findByIdAndUpdate(
            id,
            {
                $set: {
                    isVerified: true,
                    verifiedBy: req.user.username,
                    verifiedAt: new Date(),
                    notes: notes || ''
                }
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Academic result not found'
            });
        }

        res.json({
            success: true,
            message: 'Academic result verified successfully',
            data: result.getFormattedResult()
        });

    } catch (error) {
        console.error('Error verifying result:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify result',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;