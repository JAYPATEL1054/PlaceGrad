const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        console.log('Auth middleware - Authorization header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth middleware - No valid token provided');
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify token
            console.log('Auth middleware - Verifying token:', token.substring(0, 50) + '...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('Auth middleware - Token decoded successfully:', decoded);
            
            // Check if user still exists and is active
            console.log('Auth middleware - Looking for user with ID:', decoded.userId);
            const user = await User.findById(decoded.userId).select('-password');
            console.log('Auth middleware - User found:', user ? 'Yes' : 'No');
            
            if (!user) {
                console.log('Auth middleware - User not found in database');
                return res.status(401).json({
                    success: false,
                    message: 'Token is invalid - user not found'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Add user info to request
            req.user = {
                id: user._id.toString(),
                userId: user._id.toString(), // Keep both for compatibility
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile
            };

            next();
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid'
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

// Faculty or Admin middleware
const facultyOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!['faculty', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Faculty or Admin access required'
        });
    }

    next();
};

module.exports = { auth, adminOnly, facultyOrAdmin };