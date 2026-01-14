const User = require('../models/User');
const { validateRegistrationInput, sanitizeInput } = require('../utils/validators');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Get all users excluding passwords
        const users = await User.find({})
            .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users: users,
            count: users.length
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Toggle user active status (admin only)
exports.toggleUserStatus = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { userId } = req.params;

        // Prevent admin from deactivating themselves
        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Toggle status
        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user._id,
                username: user.username,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { userId } = req.params;
        const { username, email, role, profile } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if username or email already exists for other users
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ 
                username: username, 
                _id: { $ne: userId } 
            });
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
        }

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ 
                email: email, 
                _id: { $ne: userId } 
            });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update user fields
        if (username) user.username = sanitizeInput(username);
        if (email) user.email = email.toLowerCase();
        if (role && ['student', 'faculty', 'admin'].includes(role)) {
            user.role = role;
        }
        if (profile) {
            user.profile = { ...user.profile, ...profile };
        }

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get dashboard statistics (admin only)
exports.getDashboardStats = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        
        const studentCount = await User.countDocuments({ role: 'student' });
        const facultyCount = await User.countDocuments({ role: 'faculty' });
        const adminCount = await User.countDocuments({ role: 'admin' });

        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({ 
            createdAt: { $gte: thirtyDaysAgo } 
        });

        // Get users with recent login (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLogins = await User.countDocuments({ 
            lastLogin: { $gte: sevenDaysAgo } 
        });

        res.json({
            success: true,
            stats: {
                total: {
                    users: totalUsers,
                    active: activeUsers,
                    inactive: inactiveUsers
                },
                roles: {
                    students: studentCount,
                    faculty: facultyCount,
                    admins: adminCount
                },
                activity: {
                    recentRegistrations: recentRegistrations,
                    recentLogins: recentLogins
                }
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Create user by admin (enhanced registration)
exports.createUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { username, email, password, role, profile } = req.body;

        // Validate input
        const validation = validateRegistrationInput(username, email, password);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors[0]
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { username: sanitizeInput(username) },
                { email: email.toLowerCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Validate role
        const validRoles = ['student', 'faculty', 'admin'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Create new user
        const user = new User({
            username: sanitizeInput(username),
            email: email.toLowerCase(),
            password: password,
            role: role || 'student',
            profile: profile || {},
            isActive: true,
            isEmailVerified: true // Admin created users are auto-verified
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Search users (admin only)
exports.searchUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { query, role, status, page = 1, limit = 20 } = req.query;

        let searchCriteria = {};

        // Text search
        if (query) {
            const searchRegex = new RegExp(query, 'i');
            searchCriteria.$or = [
                { username: searchRegex },
                { email: searchRegex },
                { 'profile.firstName': searchRegex },
                { 'profile.lastName': searchRegex },
                { 'profile.department': searchRegex },
                { 'profile.enrollmentNumber': searchRegex }
            ];
        }

        // Role filter
        if (role && ['student', 'faculty', 'admin'].includes(role)) {
            searchCriteria.role = role;
        }

        // Status filter
        if (status === 'active') {
            searchCriteria.isActive = true;
        } else if (status === 'inactive') {
            searchCriteria.isActive = false;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(searchCriteria)
            .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(searchCriteria);

        res.json({
            success: true,
            users: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalUsers: total,
                hasNext: skip + users.length < total,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};