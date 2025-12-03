const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware to log user activities
 */
async function logActivity(userId, userEmail, userName, action, details = {}, req = null) {
    try {
        const logEntry = {
            userId,
            userEmail,
            userName,
            action,
            details,
            ipAddress: req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : null,
            userAgent: req ? req.headers['user-agent'] : null
        };

        await ActivityLog.create(logEntry);
        console.log(`[ACTIVITY LOG] ${userName} (${userEmail}) - ${action}`);
    } catch (err) {
        console.error('Error logging activity:', err);
        // Don't throw error - logging should not break the app
    }
}

/**
 * Express middleware to automatically log API requests
 */
function activityLogger(action, getDetails = null) {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        // Override send function to log after response
        res.send = function (data) {
            // Only log successful requests (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Get user info from request body or query
                const userId = req.body?.userId || req.query?.userId || req.user?._id;
                const userEmail = req.body?.userEmail || req.user?.email;
                const userName = req.body?.userName || req.user?.name;

                if (userId && userEmail && userName) {
                    const details = getDetails ? getDetails(req, res) : {
                        method: req.method,
                        path: req.path,
                        body: req.body
                    };

                    logActivity(userId, userEmail, userName, action, details, req).catch(err => {
                        console.error('Activity logging failed:', err);
                    });
                }
            }

            // Call original send
            originalSend.call(this, data);
        };

        next();
    };
}

module.exports = { logActivity, activityLogger };
