const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import configurations
const connectDB = require('./config/database');

// Import routes
const routes = require('./routes');
const academicResultRoutes = require('./routes/academicResultRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import models
const AcademicResult = require('./models/AcademicResult');

// Extra dependencies for resume analyzer proxy
const fileUpload = require("express-fileupload");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload());

// Disable caching for static files
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    lastModified: false,
    maxAge: 0,
    cacheControl: false
}));

// API Routes
app.use('/api', routes);
app.use('/api/academic-results', academicResultRoutes);

// Resume Analyzer Proxy Route
app.post("/api/analyze", async (req, res) => {
    try {
        if (!req.files || !req.files.resume) {
            return res.status(400).json({ error: "No resume uploaded" });
        }

        const formData = new FormData();
        formData.append("resume", req.files.resume.data, req.files.resume.name);

        const response = await axios.post("http://127.0.0.1:5000/analyze", formData, {
            headers: formData.getHeaders(),
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error forwarding resume:", error.message);
        res.status(500).json({ error: "Resume analysis failed" });
    }
});

// Legacy endpoint for backward compatibility (for old frontend code)
app.post('/save_result', async (req, res) => {
    try {
        const { username, type, percentage } = req.body;
        
        // Validation
        if (!username || !type || !percentage) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: username, type, percentage'
            });
        }

        if (!['tenth', 'twelfth'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be either "tenth" or "twelfth"'
            });
        }

        // Calculate marks based on standard totals
        const totalMarks = type === 'twelfth' ? 500 : 600;
        const obtainedMarks = Math.round((parseFloat(percentage) / 100) * totalMarks);
        
        // Create new academic result
        const academicResult = new AcademicResult({
            username,
            resultType: type,
            obtainedMarks,
            totalMarks,
            percentage: parseFloat(percentage),
            extractedAt: new Date(),
            createdAt: new Date(),
            metadata: {
                extractionSource: 'ocr',
                documentType: 'unknown',
                confidence: 0.8
            }
        });

        // Save to MongoDB
        const savedResult = await academicResult.save();

        res.status(201).json({
            success: true,
            message: `${type} academic result saved successfully`,
            data: {
                id: savedResult._id,
                username: savedResult.username,
                resultType: savedResult.resultType,
                percentage: savedResult.percentage,
                createdAt: savedResult.createdAt
            }
        });

    } catch (error) {
        console.error('Error saving academic result:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to save academic result',
            error: error.message
        });
    }
});

// Serve static HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/otp-verification', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'otp-verification.html'));
});
app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});
app.get('/companies', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'companies.html'));
});
app.get('/add-companies', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add-companies.html'));
});

// Serve My Resume page
app.get('/myresume', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'myresume.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Additional endpoints for academic results management

// Get academic results summary for dashboard
app.get('/api/academic-results/summary', async (req, res) => {
    try {
        const tenthResults = await AcademicResult.countDocuments({ resultType: 'tenth' });
        const twelfthResults = await AcademicResult.countDocuments({ resultType: 'twelfth' });
        const totalResults = tenthResults + twelfthResults;
        
        const avgTenthPercentage = await AcademicResult.aggregate([
            { $match: { resultType: 'tenth' } },
            { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } }
        ]);
        
        const avgTwelfthPercentage = await AcademicResult.aggregate([
            { $match: { resultType: 'twelfth' } },
            { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalResults,
                tenthResults,
                twelfthResults,
                averages: {
                    tenth: avgTenthPercentage[0]?.avgPercentage?.toFixed(2) || 0,
                    twelfth: avgTwelfthPercentage[0]?.avgPercentage?.toFixed(2) || 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching academic results summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch summary',
            error: error.message
        });
    }
});

// Get academic results by date range
app.get('/api/academic-results/by-date', async (req, res) => {
    try {
        const { startDate, endDate, resultType } = req.query;
        
        let query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (resultType && ['tenth', 'twelfth'].includes(resultType)) {
            query.resultType = resultType;
        }

        const results = await AcademicResult.find(query)
            .sort({ createdAt: -1 })
            .select('username resultType percentage createdAt')
            .limit(100);

        res.json({
            success: true,
            data: results,
            count: results.length
        });

    } catch (error) {
        console.error('Error fetching academic results by date:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch results by date',
            error: error.message
        });
    }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Visit: http://localhost:${PORT}`);
            console.log('Academic Results API endpoints:');
            console.log(`  POST ${PORT}/api/academic-results - Save new result`);
            console.log(`  GET  ${PORT}/api/academic-results/:username - Get user results`);
            console.log(`  GET  ${PORT}/api/academic-results - Get all results (admin)`);
            console.log(`  POST ${PORT}/save_result - Legacy endpoint`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
