const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import configurations
const connectDB = require('./config/database');

// Import routes
const routes = require('./routes');
const academicResultRoutes = require('./routes/academicResultRoutes');
const applicationRoutes = require('./routes/application');

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
app.use('/api/applications', applicationRoutes);

// Chatbot Proxy Routes
app.post('/chat', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/chat', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding chat request:', error.message);
        res.status(500).json({ error: 'Chat service unavailable' });
    }
});

app.get('/history', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5000/history');
        res.json(response.data);
    } catch (error) {
        console.error('Error getting chat history:', error.message);
        res.status(500).json({ error: 'Chat history unavailable' });
    }
});

app.post('/clear', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/clear');
        res.json(response.data);
    } catch (error) {
        console.error('Error clearing chat history:', error.message);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

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

// Combined health check (Node + Flask)
app.get('/api/system-health', async (req, res) => {
    try {
        // Call Flask health endpoint
        const flaskHealth = await axios.get("http://127.0.0.1:5000/health");

        res.json({
            node: {
                status: "healthy",
                port: PORT,
                timestamp: new Date().toISOString()
            },
            flask: flaskHealth.data
        });
    } catch (err) {
        res.json({
            node: {
                status: "healthy",
                port: PORT,
                timestamp: new Date().toISOString()
            },
            flask: {
                status: "unreachable",
                error: err.message
            }
        });
    }
});
// Add these routes to your Node.js server (after your existing routes)

// Chatbot proxy routes to Flask backend
app.post('/chat', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/chat', req.body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        console.error('Chat proxy error:', error.message);
        
        // Fallback response if Flask is down
        const fallbackResponse = getFallbackChatResponse(req.body.message);
        res.json({ reply: fallbackResponse });
    }
});

app.get('/history', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5000/history', {
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        console.error('History proxy error:', error.message);
        res.json([]); // Return empty history if Flask is down
    }
});

app.post('/clear', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/clear', {}, {
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        console.error('Clear proxy error:', error.message);
        res.json({ status: 'cleared' }); // Fallback response
    }
});

// Fallback chatbot responses (same as your Flask app.py)
function getFallbackChatResponse(message) {
    if (!message) return "I'm not sure I understood that. How can I help you?";
    
    const msg = message.toLowerCase();

    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hello! How can I help you — with interviews, placements, resume tips, technical prep, or company details?";
    }

    // Company information
    if (msg.includes('synoptek')) {
        return "**Synoptek Placement & Internship Info**\n" +
            "Positions & Vacancies (Full-time):\n" +
            "   • Software Engineer → 20 openings\n" +
            "   • Support Engineer → 10 openings\n" +
            "   • Data Analyst → 5 openings\n" +
            "   • Network Engineer → 6 openings\n" +
            "   • Cloud Engineer → 4 openings\n" +
            "Eligibility: Min 60% throughout academics\n" +
            "Requirements: Java/Python, SQL, Networking, Cloud basics\n" +
            "Bond: 2 years\n" +
            "Internship: Software Engineer Intern → 6 months, Stipend ₹20,000/month";
    }

    if (msg.includes('openxcell') || msg.includes('open excel')) {
        return "**OpenXcell Placement & Internship Info**\n" +
            "Positions & Vacancies (Full-time):\n" +
            "   • Software Developer → 15 openings\n" +
            "   • QA Engineer → 8 openings\n" +
            "   • Mobile App Developer (Android/iOS) → 6 openings\n" +
            "   • UI/UX Designer → 4 openings\n" +
            "   • DevOps Engineer → 3 openings\n" +
            "Eligibility: Min 55% aggregate\n" +
            "Requirements: Web Development, Mobile App, Testing, UI/UX\n" +
            "Bond: 2 years\n" +
            "Internship: Mobile App Developer Intern → 4 months, Stipend ₹12,000/month";
    }

    if (msg.includes('einfochips')) {
        return "**eInfochips Placement & Internship Info**\n" +
            "Positions & Vacancies (Full-time):\n" +
            "   • Embedded Engineer → 12 openings\n" +
            "   • VLSI Engineer → 10 openings\n" +
            "   • Software Engineer → 18 openings\n" +
            "   • Hardware Design Engineer → 8 openings\n" +
            "   • AI/ML Engineer → 6 openings\n" +
            "   • Verification Engineer → 7 openings\n" +
            "Eligibility: Min 65% aggregate\n" +
            "Requirements: C/C++, Embedded Systems, Digital Electronics, AI/ML\n" +
            "Bond: 3 years\n" +
            "Internship: Embedded Systems Intern → 6 months, Stipend ₹18,000/month";
    }

    if (msg.includes('upcoming companies') || msg.includes('companies')) {
        return "Upcoming Companies & Openings:\n" +
                "1. Synoptek → 45 positions (Software 20, Support 10, Data 5, Network 6, Cloud 4)\n" +
                "2. OpenXcell → 36 positions (Developer 15, QA 8, Mobile 6, UI/UX 4, DevOps 3)\n" +
                "3. eInfochips → 61 positions (Embedded 12, VLSI 10, Software 18, Hardware 8, AI/ML 6, Verification 7)\n" +
                "4. Motadata → 23 positions (Software 10, Backend 5, Frontend 5, DevOps 3)\n" +
                "5. RtCamp → 21 positions (Web 7, Frontend 5, Backend 4, QA 3, DevOps 2)";
    }
    
    // Interview-related queries
    if (msg.includes('interviews') || msg.includes('interview tips')) {
        return "Interview Tips:\n1. Research the company\n2. Prepare HR & technical questions\n3. Be confident and clear.";
    }

    if (msg.includes('common interview')) {
        return "Common HR Questions: Tell me about yourself, Strengths/Weaknesses, Why should we hire you?";
    }

    if (msg.includes('placement process') || msg.includes('placements')) {
        return "Placement process: Aptitude → Group Discussion → Technical Interview → HR Interview.";
    }

    if (msg.includes('placement tips')) {
        return "Tips: Practice aptitude, improve coding skills, revise CS fundamentals, and polish soft skills.";
    }

    if (msg.includes('resume tips')) {
        return "Resume should be concise, 1 page ideally, highlight internships/projects, use clean format.";
    }

    if (msg.includes('internships') || msg.includes('internship tips')) {
        return "Internships provide real-world experience. Apply early, tailor your resume, and prepare for interviews.";
    }

    // General fallback
    return "I'm not sure I understood that. Try asking about 'resume tips', 'interview tips', 'placement process', or specific company names like 'Synoptek' or 'OpenXcell'.";
}

startServer();

module.exports = app;
