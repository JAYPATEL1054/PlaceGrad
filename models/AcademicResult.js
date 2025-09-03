const mongoose = require('mongoose');

const academicResultSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        index: true,
        minlength: [2, 'Username must be at least 2 characters'],
        maxlength: [50, 'Username cannot exceed 50 characters']
    },
    resultType: {
        type: String,
        required: [true, 'Result type is required'],
        enum: {
            values: ['tenth', 'twelfth'],
            message: 'Result type must be either "tenth" or "twelfth"'
        },
        index: true
    },
    obtainedMarks: {
        type: Number,
        required: [true, 'Obtained marks is required'],
        min: [0, 'Obtained marks cannot be negative'],
        max: [1000, 'Obtained marks seems too high'],
        validate: {
            validator: function(value) {
                return Number.isInteger(value);
            },
            message: 'Obtained marks must be a whole number'
        }
    },
    totalMarks: {
        type: Number,
        required: [true, 'Total marks is required'],
        min: [100, 'Total marks seems too low'],
        max: [1000, 'Total marks seems too high'],
        validate: {
            validator: function(value) {
                return Number.isInteger(value);
            },
            message: 'Total marks must be a whole number'
        }
    },
    percentage: {
        type: Number,
        required: [true, 'Percentage is required'],
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100'],
        validate: {
            validator: function(value) {
                return value >= 0 && value <= 100;
            },
            message: 'Percentage must be between 0 and 100'
        }
    },
    extractedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Additional metadata for tracking
    metadata: {
        extractionSource: {
            type: String,
            enum: ['ocr', 'manual', 'import'],
            default: 'ocr'
        },
        documentType: {
            type: String,
            enum: ['pdf', 'image', 'unknown'],
            default: 'unknown'
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.8
        },
        // Store original filename if needed
        originalFilename: {
            type: String,
            maxlength: [255, 'Filename too long']
        },
        // OCR processing details
        processingTime: {
            type: Number,
            min: 0
        },
        ocrEngine: {
            type: String,
            default: 'tesseract'
        }
    },
    // Track if this result has been verified by admin
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: String,
        trim: true
    },
    verifiedAt: {
        type: Date
    },
    // Comments or notes
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    collection: 'academic_results'
});

// Compound indexes for efficient queries
academicResultSchema.index({ username: 1, resultType: 1 });
academicResultSchema.index({ username: 1, createdAt: -1 });
academicResultSchema.index({ resultType: 1, createdAt: -1 });
academicResultSchema.index({ isVerified: 1, createdAt: -1 });

// Virtual for grade calculation based on percentage
academicResultSchema.virtual('grade').get(function() {
    const percentage = this.percentage;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
});

// Virtual for pass/fail status
academicResultSchema.virtual('isPassed').get(function() {
    return this.percentage >= 35; // Assuming 35% is passing grade
});

// Instance method to check if result calculation is valid
academicResultSchema.methods.isValidResult = function() {
    const calculatedPercentage = (this.obtainedMarks / this.totalMarks) * 100;
    const difference = Math.abs(this.percentage - calculatedPercentage);
    
    return this.obtainedMarks <= this.totalMarks && 
           this.percentage <= 100 && 
           difference < 0.5; // Allow for small rounding differences
};

// Instance method to get formatted result
academicResultSchema.methods.getFormattedResult = function() {
    return {
        id: this._id,
        username: this.username,
        resultType: this.resultType,
        obtainedMarks: this.obtainedMarks,
        totalMarks: this.totalMarks,
        percentage: this.percentage,
        grade: this.grade,
        isPassed: this.isPassed,
        isVerified: this.isVerified,
        createdAt: this.createdAt,
        extractedAt: this.extractedAt
    };
};

// Static method to get user's latest results
academicResultSchema.statics.getLatestResults = async function(username) {
    const tenthResult = await this.findOne({ 
        username, 
        resultType: 'tenth' 
    }).sort({ createdAt: -1 });
    
    const twelfthResult = await this.findOne({ 
        username, 
        resultType: 'twelfth' 
    }).sort({ createdAt: -1 });
    
    return {
        tenth: tenthResult,
        twelfth: twelfthResult
    };
};

// Static method to get statistics
academicResultSchema.statics.getStatistics = async function(resultType = null) {
    let matchQuery = {};
    if (resultType && ['tenth', 'twelfth'].includes(resultType)) {
        matchQuery.resultType = resultType;
    }
    
    const stats = await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$resultType',
                count: { $sum: 1 },
                avgPercentage: { $avg: '$percentage' },
                minPercentage: { $min: '$percentage' },
                maxPercentage: { $max: '$percentage' },
                avgObtained: { $avg: '$obtainedMarks' }
            }
        }
    ]);
    
    return stats;
};

// Pre-save validation and processing
academicResultSchema.pre('save', function(next) {
    // Validate percentage calculation
    const calculatedPercentage = (this.obtainedMarks / this.totalMarks) * 100;
    const difference = Math.abs(this.percentage - calculatedPercentage);
    
    if (difference > 0.5) {
        return next(new Error(`Percentage mismatch: calculated ${calculatedPercentage.toFixed(2)}% but provided ${this.percentage}%`));
    }
    
    // Ensure obtained marks don't exceed total marks
    if (this.obtainedMarks > this.totalMarks) {
        return next(new Error('Obtained marks cannot exceed total marks'));
    }
    
    // Round percentage to 2 decimal places
    this.percentage = Math.round(this.percentage * 100) / 100;
    
    // Set default total marks based on result type if not provided
    if (!this.totalMarks) {
        this.totalMarks = this.resultType === 'twelfth' ? 500 : 600;
    }
    
    next();
});

// Pre-update validation
academicResultSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    
    if (update.obtainedMarks && update.totalMarks) {
        if (update.obtainedMarks > update.totalMarks) {
            return next(new Error('Obtained marks cannot exceed total marks'));
        }
    }
    
    next();
});

// Post-save hook for logging
academicResultSchema.post('save', function(doc, next) {
    console.log(`Academic result saved: ${doc.username} - ${doc.resultType} - ${doc.percentage}% (${doc.obtainedMarks}/${doc.totalMarks})`);
    next();
});

// Post-save hook for cleanup or additional processing
academicResultSchema.post('save', async function(doc, next) {
    // You can add additional processing here, such as:
    // - Sending notifications
    // - Updating user profiles
    // - Triggering webhooks
    
    try {
        // Example: Keep only the latest 10 results per user per type
        const results = await this.constructor.find({
            username: doc.username,
            resultType: doc.resultType
        }).sort({ createdAt: -1 });
        
        if (results.length > 10) {
            const toDelete = results.slice(10).map(r => r._id);
            await this.constructor.deleteMany({ _id: { $in: toDelete } });
            console.log(`Cleaned up ${toDelete.length} old results for ${doc.username} - ${doc.resultType}`);
        }
    } catch (error) {
        console.warn('Error in post-save cleanup:', error.message);
    }
    
    next();
});

// Add text index for search functionality
academicResultSchema.index({
    username: 'text',
    notes: 'text'
});

module.exports = mongoose.model('AcademicResult', academicResultSchema);