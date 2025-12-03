const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            // Auth actions
            'login', 'logout', 'signup', 'google_login',
            // Quiz actions
            'quiz_created', 'quiz_updated', 'quiz_deleted', 'quiz_duplicated',
            // Session actions
            'session_created', 'session_joined', 'session_started', 'session_ended',
            // Answer actions
            'answer_submitted',
            // Admin actions
            'user_deactivated', 'user_activated', 'admin_access',
            // Other
            'page_view', 'error'
        ]
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Flexible object for additional data
        default: {}
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
