const Application = require('../models/Application');
const Company = require('../models/Company');
const User = require('../models/User');

// Apply to a company
const applyToCompany = async (req, res) => {
    try {
        console.log('Apply to company request:', {
            body: req.body,
            user: req.user,
            headers: req.headers
        });
        
        const { companyId, coverLetter, resumeUrl } = req.body;
        const userId = req.user.id;

        console.log('Looking for user with ID:', userId);
        console.log('User ID type:', typeof userId);

        // Check if user exists and get their profile
        const user = await User.findById(userId);
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
            console.log('User details:', {
                id: user._id,
                username: user.username,
                email: user.email,
                isActive: user.isActive
            });
        }
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                debug: {
                    userId: userId,
                    userIdType: typeof userId
                }
            });
        }

        // Check if company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if user has already applied to this company
        const existingApplication = await Application.findOne({
            userId: userId,
            companyId: companyId
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this company'
            });
        }

        // Check eligibility (basic validation)
        const profile = user.profile || {};
        const tenthPercentage = profile.tenthPercentage || 0;
        const twelfthPercentage = profile.twelfthPercentage || 0;
        const cgpa = profile.cgpa || 0;

        // Basic eligibility check (can be enhanced based on company requirements)
        if (tenthPercentage < 60 || twelfthPercentage < 60) {
            return res.status(400).json({
                success: false,
                message: 'You do not meet the minimum eligibility criteria (60% in 10th and 12th)'
            });
        }

        // Create application
        const application = new Application({
            userId: userId,
            companyId: companyId,
            companyName: company.name,
            position: company.position,
            studentInfo: {
                enrollmentNumber: profile.enrollmentNumber,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: user.email,
                phone: profile.phone,
                department: profile.department,
                semester: profile.semester,
                tenthPercentage: tenthPercentage,
                twelfthPercentage: twelfthPercentage,
                cgpa: cgpa
            },
            coverLetter: coverLetter || '',
            resumeUrl: resumeUrl || ''
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                applicationId: application._id,
                companyName: company.name,
                position: company.position,
                appliedAt: application.appliedAt
            }
        });

    } catch (error) {
        console.error('Error applying to company:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user's applications
const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { userId: userId };
        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate('companyId', 'name industry logoUrl')
            .sort({ appliedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Application.countDocuments(query);

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalApplications: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all applications (admin only)
const getAllApplications = async (req, res) => {
    try {
        const { companyId, status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (companyId) query.companyId = companyId;
        if (status) query.status = status;

        const applications = await Application.find(query)
            .populate('userId', 'username email profile.firstName profile.lastName')
            .populate('companyId', 'name industry')
            .sort({ appliedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Application.countDocuments(query);

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalApplications: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update application status (admin only)
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, adminNotes, interviewScheduled, interviewLocation, finalOutcome } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Update fields
        if (status) application.status = status;
        if (adminNotes) application.adminNotes = adminNotes;
        if (interviewScheduled) application.interviewScheduled = new Date(interviewScheduled);
        if (interviewLocation) application.interviewLocation = interviewLocation;
        if (finalOutcome) {
            application.finalOutcome = finalOutcome;
            application.outcomeDate = new Date();
        }

        await application.save();

        res.json({
            success: true,
            message: 'Application status updated successfully',
            data: application
        });

    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user's application status for dashboard
const getUserApplicationStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all applications for the user with company details
        const applications = await Application.find({ userId: userId })
            .populate('companyId', 'name industry')
            .sort({ appliedAt: -1 })
            .select('companyName position status appliedAt companyId');

        // Format the data for dashboard display
        const applicationStatus = applications.map(app => ({
            companyName: app.companyName,
            position: app.position,
            status: app.status,
            appliedAt: app.appliedAt
        }));

        res.json({
            success: true,
            data: {
                applications: applicationStatus,
                totalApplications: applications.length
            }
        });

    } catch (error) {
        console.error('Error fetching user application status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
    try {
        const stats = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalApplications = await Application.countDocuments();
        const recentApplications = await Application.countDocuments({
            appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        });

        res.json({
            success: true,
            data: {
                statusBreakdown: stats,
                totalApplications,
                recentApplications
            }
        });

    } catch (error) {
        console.error('Error fetching application stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    applyToCompany,
    getUserApplications,
    getAllApplications,
    updateApplicationStatus,
    getApplicationStats,
    getUserApplicationStatus
};
