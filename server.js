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

// ====================================================
// ENHANCED CHATBOT PROXY ROUTES
// ====================================================

// Main chat endpoint (enhanced)
app.post('/chat', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/chat', req.body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000 // Increased timeout for AI processing
        });
        res.json(response.data);
    } catch (error) {
        console.error('Chat proxy error:', error.message);
        
        // Enhanced fallback response
        const fallbackResponse = req.body.question ? 
            getUniversalFallbackResponse(req.body.question) : 
            getFallbackChatResponse(req.body.message);
            
        res.json({ reply: fallbackResponse });
    }
});

// Universal question answering endpoint
app.post('/chat/ask', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/chat/ask', req.body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        res.json(response.data);
    } catch (error) {
        console.error('Ask anything proxy error:', error.message);
        
        // Enhanced fallback for universal questions
        const fallbackResponse = getUniversalFallbackResponse(req.body.question);
        res.json({ 
            question: req.body.question,
            answer: fallbackResponse,
            timestamp: Math.floor(Date.now() / 1000)
        });
    }
});

// Get chatbot capabilities
app.get('/chat/capabilities', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5000/chat/capabilities', {
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        console.error('Capabilities proxy error:', error.message);
        // Return default capabilities if Flask is down
        res.json({
            capabilities: [
                "Placement and career guidance",
                "Interview preparation and tips", 
                "Resume analysis and suggestions",
                "Company information and requirements",
                "Technical skill development advice",
                "General knowledge questions (limited when AI service unavailable)",
                "Educational support",
                "Problem-solving assistance",
                "Programming and coding help",
                "Math and calculations",
                "Science explanations"
            ],
            specialized_areas: [
                "Synoptek placement info",
                "OpenXcell opportunities", 
                "eInfochips requirements",
                "Motadata positions",
                "RtCamp careers"
            ]
        });
    }
});

// Chat history endpoint
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

// Clear chat history endpoint
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

// ====================================================
// FALLBACK RESPONSE FUNCTIONS
// ====================================================

// Enhanced fallback function for universal questions
function getUniversalFallbackResponse(question) {
    if (!question) return "Please ask me something! I can help with placements, career guidance, or other questions.";
    
    const q = question.toLowerCase();
    
    // Math questions
    if (q.includes('calculate') || q.includes('math') || q.includes('equation') || q.includes('solve')) {
        return "I can help with basic math! However, my calculation abilities are limited when my AI service is unavailable. For complex calculations, I'd recommend using a calculator or asking me about placement-related calculations like salary comparisons or percentage calculations.";
    }
    
    // Science questions
    if (q.includes('science') || q.includes('physics') || q.includes('chemistry') || q.includes('biology')) {
        return "That's a great science question! While I can provide basic information, my detailed science knowledge is limited when my AI service is unavailable. I can definitely help with computer science topics related to programming and technical interviews though!";
    }
    
    // Technology questions
    if (q.includes('programming') || q.includes('coding') || q.includes('algorithm') || q.includes('data structure') || q.includes('software') || q.includes('computer')) {
        return "Programming and coding are essential for tech placements! I can help with interview preparation, coding best practices, and technical skill development. For detailed programming explanations, my AI service provides better responses. What specific programming topic would you like to discuss for your career preparation?";
    }
    
    // AI/ML questions
    if (q.includes('artificial intelligence') || q.includes('machine learning') || q.includes('ai') || q.includes('ml') || q.includes('deep learning')) {
        return "AI and Machine Learning are hot topics in tech placements! These fields involve algorithms that learn from data to make predictions or decisions. Many companies like Google, Microsoft, and startups are hiring for AI/ML roles. Would you like to know about AI/ML interview preparation or career paths?";
    }
    
    // General knowledge
    if (q.includes('what is') || q.includes('define') || q.includes('explain') || q.includes('how does')) {
        return "I'd be happy to explain that! However, my detailed explanations are best when my full AI capabilities are available. Right now, I can provide excellent guidance on placement-related topics, interview preparation, and career advice. Is there a career or placement aspect of your question I can help with?";
    }
    
    // Current events
    if (q.includes('news') || q.includes('current') || q.includes('today') || q.includes('latest') || q.includes('recent')) {
        return "For current news and events, I'd recommend checking reliable news sources. However, I can help you stay updated on the latest job market trends, placement opportunities, and career development news in the tech industry!";
    }
    
    // History questions
    if (q.includes('history') || q.includes('historical') || q.includes('ancient') || q.includes('medieval')) {
        return "History questions are interesting! While my historical knowledge is limited without my AI service, I can help you understand the history of technology, programming languages, or the evolution of the tech industry - all valuable for tech interviews!";
    }
    
    // Geography questions
    if (q.includes('geography') || q.includes('country') || q.includes('capital') || q.includes('continent')) {
        return "Geography is important for understanding global business! While I have limited geographical information without my AI service, I can help you learn about tech hubs around the world, company locations, and international career opportunities.";
    }
    
    // Use existing placement fallback logic
    return getFallbackChatResponse(question);
}

// Original fallback chatbot responses
function getFallbackChatResponse(message) {
    if (!message) return "I'm not sure I understood that. How can I help you?";
    
    const msg = message.toLowerCase();

    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hello! How can I help you today? I can assist with interviews, placements, resume tips, technical prep, company details, or any other questions you might have!";
    }

    if (msg.includes('how are you') || msg.includes('how r u')) {
        return "I'm doing great, thank you for asking! I'm here to help you with placements, interviews, career guidance, or any other questions you might have. How can I assist you today?";
    }

    if (msg.includes('what is your name') || msg.includes('who are you') || msg.includes('tell me your name') || msg.includes('your name')) {
        return "I'm PlaceGrad Bot, your AI assistant! I specialize in placement and career guidance, but I can also help with general questions. How can I assist you?";
    }

    if (msg.includes('thank you') || msg.includes('thanks')) {
        return "You're welcome! Feel free to ask me anything about placements, interviews, career guidance, or any other questions anytime.";
    }

    if (msg.includes('bye') || msg.includes('goodbye')) {
        return "Goodbye! Best of luck with your placements and studies. Come back anytime you need help!";
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

    if (msg.includes('motadata')) {
        return "**Motadata Placement & Internship Info**\n" +
            "Positions & Vacancies (Full-time):\n" +
            "   • Software Engineer (R&D, Product Dev) → 10 openings\n" +
            "   • Backend Developer → 5 openings\n" +
            "   • Frontend Developer → 5 openings\n" +
            "   • DevOps Engineer → 3 openings\n" +
            "Eligibility: Min 60% aggregate\n" +
            "Requirements: Java, Networking, Linux, ReactJS, APIs, Cloud\n" +
            "Bond: 2 years\n" +
            "Internship: QA/Testing Intern → 3 months, Stipend ₹10,000/month";
    }

    if (msg.includes('rtcamp')) {
        return "**RtCamp Placement & Internship Info**\n" +
            "Positions & Vacancies (Full-time):\n" +
            "   • Web Developer (WordPress, PHP, JS) → 7 openings\n" +
            "   • Frontend Engineer (ReactJS) → 5 openings\n" +
            "   • Backend Engineer (PHP, Node.js) → 4 openings\n" +
            "   • QA Automation Engineer → 3 openings\n" +
            "   • DevOps Engineer → 2 openings\n" +
            "Eligibility: Min 55% aggregate\n" +
            "Requirements: PHP, JavaScript, React, DevOps, Testing\n" +
            "Bond: No bond mentioned\n" +
            "Internship: Web Developer Intern → 3–6 months, Stipend ₹8,000/month";
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
        return "**Interview Tips:**\n1. Research the company thoroughly\n2. Prepare HR & technical questions\n3. Practice coding problems\n4. Be confident and clear in communication\n5. Prepare STAR method examples\n6. Ask thoughtful questions about the role";
    }

    if (msg.includes('common interview') || msg.includes('hr questions')) {
        return "**Common HR Questions:**\n• Tell me about yourself\n• What are your strengths and weaknesses?\n• Why do you want to work here?\n• Where do you see yourself in 5 years?\n• Why should we hire you?\n• Describe a challenge you overcame\n• What motivates you?";
    }

    if (msg.includes('placement process') || msg.includes('placements')) {
        return "**Placement Process:** Aptitude Test → Group Discussion → Technical Interview → HR Interview → Final Selection";
    }

    if (msg.includes('placement tips')) {
        return "**Placement Tips:**\n• Practice aptitude regularly\n• Improve coding skills on platforms like LeetCode\n• Revise CS fundamentals (OS, DBMS, Networks)\n• Polish soft skills and communication\n• Build a strong resume with projects\n• Stay updated with latest technology trends";
    }

    if (msg.includes('resume tips') || msg.includes('resume')) {
        return "**Resume Tips:**\n• Keep it concise (1-2 pages max)\n• Use action verbs and quantify achievements\n• Highlight relevant projects and internships\n• Include technical skills prominently\n• Use clean, professional formatting\n• Tailor for each job application\n• Proofread carefully for errors";
    }

    if (msg.includes('technical interview') || msg.includes('coding interview')) {
        return "**Technical Interview Prep:**\n• Practice data structures and algorithms\n• Review system design concepts\n• Be comfortable with your preferred programming language\n• Practice coding on whiteboard/paper\n• Understand time and space complexity\n• Review your projects thoroughly\n• Practice explaining your thought process";
    }

    // General fallback
    return "I'm here to help with placements, career guidance, and general questions! Try asking about 'interview tips', 'resume advice', 'placement process', specific companies like 'Synoptek', or any other question you have in mind.";
}

// ====================================================
// RESUME ANALYZER PROXY ROUTE
// ====================================================
app.post("/api/analyze", async (req, res) => {
    try {
        if (!req.files || !req.files.resume) {
            return res.status(400).json({ error: "No resume uploaded" });
        }

        const formData = new FormData();
        formData.append("resume", req.files.resume.data, req.files.resume.name);

        const response = await axios.post("http://127.0.0.1:5000/analyze", formData, {
            headers: formData.getHeaders(),
            timeout: 30000
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error forwarding resume:", error.message);
        res.status(500).json({ error: "Resume analysis failed" });
    }
});

// ====================================================
// LEGACY ROUTES AND EXISTING FUNCTIONALITY
// ====================================================

// Legacy endpoint for backward compatibility
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

// ====================================================
// STATIC FILE SERVING
// ====================================================

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
app.get('/myresume', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'myresume.html'));
});

// ====================================================
// HEALTH CHECK ENDPOINTS
// ====================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Combined health check (Node + Flask)
app.get('/api/system-health', async (req, res) => {
    try {
        // Call Flask health endpoint
        const flaskHealth = await axios.get("http://127.0.0.1:5000/health", {
            timeout: 5000
        });

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

// ====================================================
// ERROR HANDLING AND 404
// ====================================================

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// ====================================================
// SERVER STARTUP
// ====================================================

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Enhanced PlaceGrad Server is running on port ${PORT}`);
            console.log(`📱 Visit: http://localhost:${PORT}`);
            console.log('\n🤖 Enhanced Chatbot Endpoints:');
            console.log(`  POST /chat - Main chat interface`);
            console.log(`  POST /chat/ask - Universal question answering`);
            console.log(`  GET  /chat/capabilities - Bot capabilities`);
            console.log(`  GET  /history - Chat history`);
            console.log(`  POST /clear - Clear chat history`);
            console.log('\n📄 Resume Analysis:');
            console.log(`  POST /api/analyze - Resume analysis`);
            console.log('\n📊 Academic Results API:');
            console.log(`  POST /api/academic-results - Save new result`);
            console.log(`  GET  /api/academic-results/:username - Get user results`);
            console.log(`  GET  /api/academic-results - Get all results (admin)`);
            console.log(`  POST /save_result - Legacy endpoint`);
            console.log('\n🏥 Health Checks:');
            console.log(`  GET  /api/health - Node.js health`);
            console.log(`  GET  /api/system-health - Combined Node.js + Flask health`);
            console.log('\n⚠️  Make sure Flask server is running on port 5000 for full functionality!');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;