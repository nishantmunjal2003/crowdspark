const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizSession = require('../models/QuizSession');
const ActivityLog = require('../models/ActivityLog');
const SystemSetting = require('../models/SystemSetting');
const TokenRequest = require('../models/TokenRequest');
const { sendTokenApprovedNotification } = require('../services/mailService');
const { logActivity } = require('../middleware/activityLogger');

// Middleware to check if user is admin
async function isAdmin(req, res, next) {
    try {
        const userId = req.query.userId || req.body.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized - No user ID provided' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized - User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        // Log admin access
        await logActivity(user._id, user.email, user.name, 'admin_access', {
            path: req.path,
            method: req.method
        }, req);

        req.adminUser = user;
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

// Get all users (admin only)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const rawUsers = await User.find().sort({ createdAt: -1 });

        const users = rawUsers.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            isActive: u.isActive,
            googleId: u.googleId,
            authMethod: u.googleId ? 'google' : 'email',
            aiTokens: u.aiTokens !== undefined ? u.aiTokens : 50,
            aiTokensUsed: u.aiTokensUsed || 0,
            aiTokensTotal: u.aiTokensTotal || 50,
            lastLogin: u.lastLogin,
            createdAt: u.createdAt
        }));

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get all quizzes (admin only)
router.get('/quizzes', isAdmin, async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('creatorId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: quizzes.length,
            quizzes
        });
    } catch (err) {
        console.error('Error fetching quizzes:', err);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// Get user statistics (admin only)
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const totalQuizzes = await Quiz.countDocuments();
        const totalActivities = await ActivityLog.countDocuments();

        // Calculate total participants taken across all quizzes and sessions
        const allQuizzes = await Quiz.find().select('totalParticipants');
        const quizParticipantsSum = allQuizzes.reduce((sum, q) => sum + (q.totalParticipants || 0), 0);

        const allSessions = await QuizSession.find().select('participants');
        let sessionParticipantsSum = 0;
        const uniquePlayerNames = new Set();

        allSessions.forEach(s => {
            (s.participants || []).forEach(p => {
                sessionParticipantsSum++;
                if (p.name) uniquePlayerNames.add(p.name.toLowerCase().trim());
            });
        });

        const totalParticipants = Math.max(quizParticipantsSum, sessionParticipantsSum);
        const uniqueParticipants = uniquePlayerNames.size;

        // Get recent activities
        const recentActivities = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(50);

        // Get user activity counts
        const userActivityCounts = await ActivityLog.aggregate([
            {
                $group: {
                    _id: '$userId',
                    count: { $sum: 1 },
                    lastActivity: { $max: '$timestamp' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: inactiveUsers,
                    admins: adminUsers
                },
                quizzes: {
                    total: totalQuizzes,
                    totalParticipants,
                    uniqueParticipants
                },
                activities: {
                    total: totalActivities
                }
            },
            recentActivities,
            topActiveUsers: userActivityCounts
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Deactivate user (admin only)
router.post('/users/:userId/deactivate', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deactivating yourself
        if (user._id.toString() === req.adminUser._id.toString()) {
            return res.status(400).json({ error: 'You cannot deactivate your own account' });
        }

        // Prevent deactivating other admins
        if (user.role === 'admin') {
            return res.status(400).json({ error: 'Cannot deactivate admin users' });
        }

        user.isActive = false;
        await user.save();

        // Log the action
        await logActivity(
            req.adminUser._id,
            req.adminUser.email,
            req.adminUser.name,
            'user_deactivated',
            { targetUserId: user._id, targetUserEmail: user.email },
            req
        );

        res.json({
            success: true,
            message: `User ${user.email} has been deactivated`,
            user: {
                _id: user._id,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (err) {
        console.error('Error deactivating user:', err);
        res.status(500).json({ error: 'Failed to deactivate user' });
    }
});

// Activate user (admin only)
router.post('/users/:userId/activate', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = true;
        await user.save();

        // Log the action
        await logActivity(
            req.adminUser._id,
            req.adminUser.email,
            req.adminUser.name,
            'user_activated',
            { targetUserId: user._id, targetUserEmail: user.email },
            req
        );

        res.json({
            success: true,
            message: `User ${user.email} has been activated`,
            user: {
                _id: user._id,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (err) {
        console.error('Error activating user:', err);
        res.status(500).json({ error: 'Failed to activate user' });
    }
});

// Change user role (admin only)
router.post('/users/:userId/role', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent changing your own role
        if (user._id.toString() === req.adminUser._id.toString()) {
            return res.status(400).json({ error: 'You cannot change your own role' });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log the action
        await logActivity(
            req.adminUser._id,
            req.adminUser.email,
            req.adminUser.name,
            'admin_access',
            {
                action: 'role_change',
                targetUserId: user._id,
                targetUserEmail: user.email,
                oldRole,
                newRole: role
            },
            req
        );

        res.json({
            success: true,
            message: `User ${user.email} role updated to ${role}`,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error changing user role:', err);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Get activity logs (admin only)
router.get('/logs', isAdmin, async (req, res) => {
    try {
        const { userId, action, limit = 100, skip = 0 } = req.query;

        const filter = {};
        if (userId) filter.userId = userId;
        if (action) filter.action = action;

        const logs = await ActivityLog.find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await ActivityLog.countDocuments(filter);

        res.json({
            success: true,
            count: logs.length,
            total,
            logs
        });
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

// Get user details with activity (admin only)
router.get('/users/:userId', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userWithAuth = {
            ...user.toObject(),
            authMethod: user.googleId ? 'google' : 'email'
        };

        // Get user's quizzes
        const quizzes = await Quiz.find({ creatorId: userId });

        // Get user's recent activities
        const activities = await ActivityLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(20);

        // Get activity summary
        const activitySummary = await ActivityLog.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            user: userWithAuth,
            quizzes: {
                count: quizzes.length,
                items: quizzes
            },
            activities: {
                recent: activities,
                summary: activitySummary
            }
        });
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

// --- System Settings Endpoints ---

// Get all system settings (admin only)
router.get('/settings', isAdmin, async (req, res) => {
    try {
        const settingsList = await SystemSetting.find();
        const settingsObj = {
            defaultAiTokens: 50
        };

        settingsList.forEach(s => {
            settingsObj[s.key] = s.value;
        });

        res.json({
            success: true,
            settings: settingsObj
        });
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: 'Failed to fetch system settings' });
    }
});

// Update system setting (admin only)
router.put('/settings', isAdmin, async (req, res) => {
    try {
        const { key, value, description } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ error: 'Key and value are required' });
        }

        const updated = await SystemSetting.findOneAndUpdate(
            { key },
            {
                key,
                value,
                ...(description ? { description } : {}),
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Log admin activity
        await logActivity(req.adminUser._id, req.adminUser.email, req.adminUser.name, 'admin_settings_update', {
            key,
            value
        }, req);

        res.json({
            success: true,
            message: `Setting '${key}' updated successfully`,
            setting: updated
        });
    } catch (err) {
        console.error('Error updating system setting:', err);
        res.status(500).json({ error: 'Failed to update system setting' });
    }
});

// Manage / Grant AI tokens to a user (admin only)
router.post('/users/:userId/tokens', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, action } = req.body; // action: 'add' (default) or 'set'

        const numAmount = parseInt(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            return res.status(400).json({ error: 'Valid positive token amount is required' });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const previousTokens = targetUser.aiTokens || 0;

        if (action === 'set') {
            targetUser.aiTokens = numAmount;
            targetUser.aiTokensTotal = Math.max(targetUser.aiTokensTotal || 0, numAmount + (targetUser.aiTokensUsed || 0));
        } else {
            // Default: 'add'
            targetUser.aiTokens = (targetUser.aiTokens || 0) + numAmount;
            targetUser.aiTokensTotal = (targetUser.aiTokensTotal || 0) + numAmount;
        }

        await targetUser.save();

        // Log admin activity
        await logActivity(req.adminUser._id, req.adminUser.email, req.adminUser.name, 'admin_grant_tokens', {
            targetUserId: targetUser._id,
            targetUserEmail: targetUser.email,
            amount: numAmount,
            action: action || 'add',
            previousTokens,
            newTokens: targetUser.aiTokens
        }, req);

        res.json({
            success: true,
            message: `Successfully ${action === 'set' ? 'set' : 'added'} tokens for ${targetUser.name}`,
            user: {
                _id: targetUser._id,
                email: targetUser.email,
                name: targetUser.name,
                aiTokens: targetUser.aiTokens,
                aiTokensUsed: targetUser.aiTokensUsed || 0,
                aiTokensTotal: targetUser.aiTokensTotal || 50
            }
        });
    } catch (err) {
        console.error('Error managing user tokens:', err);
        res.status(500).json({ error: 'Failed to update user tokens' });
    }
});

// Get all Token Requests (admin only)
router.get('/token-requests', isAdmin, async (req, res) => {
    try {
        const requests = await TokenRequest.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            requests
        });
    } catch (err) {
        console.error('Error fetching token requests:', err);
        res.status(500).json({ error: 'Failed to fetch token requests' });
    }
});

// Approve a Token Request (admin only)
router.post('/token-requests/:id/approve', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const tokenReq = await TokenRequest.findById(id);

        if (!tokenReq) {
            return res.status(404).json({ error: 'Token request not found' });
        }

        if (tokenReq.status === 'approved') {
            return res.status(400).json({ error: 'This token request has already been approved' });
        }

        const user = await User.findById(tokenReq.userId);
        if (!user) {
            return res.status(404).json({ error: 'User for this token request no longer exists' });
        }

        const tokensToAdd = tokenReq.tokensRequested || 50;
        user.aiTokens = (user.aiTokens || 0) + tokensToAdd;
        user.aiTokensTotal = (user.aiTokensTotal || 0) + tokensToAdd;
        await user.save();

        tokenReq.status = 'approved';
        tokenReq.reviewedBy = req.adminUser._id;
        tokenReq.reviewedAt = new Date();
        await tokenReq.save();

        // Log activity
        await logActivity(req.adminUser._id, req.adminUser.email, req.adminUser.name, 'admin_approve_tokens', {
            requestId: tokenReq._id,
            targetUserId: user._id,
            targetUserEmail: user.email,
            tokensAdded: tokensToAdd,
            amount: tokenReq.amount
        }, req);

        // Send confirmation email to user asynchronously
        sendTokenApprovedNotification(user.email, user.name, tokensToAdd).catch(err => {
            console.error('[Token Approval Email Error]:', err);
        });

        res.json({
            success: true,
            message: `Successfully credited ${tokensToAdd} AI Tokens to ${user.name}`,
            request: tokenReq,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                aiTokens: user.aiTokens,
                aiTokensUsed: user.aiTokensUsed || 0,
                aiTokensTotal: user.aiTokensTotal || 50
            }
        });
    } catch (err) {
        console.error('Error approving token request:', err);
        res.status(500).json({ error: 'Failed to approve token request' });
    }
});

// Reject a Token Request (admin only)
router.post('/token-requests/:id/reject', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const tokenReq = await TokenRequest.findById(id);

        if (!tokenReq) {
            return res.status(404).json({ error: 'Token request not found' });
        }

        tokenReq.status = 'rejected';
        tokenReq.reviewedBy = req.adminUser._id;
        tokenReq.reviewedAt = new Date();
        await tokenReq.save();

        // Log activity
        await logActivity(req.adminUser._id, req.adminUser.email, req.adminUser.name, 'admin_reject_tokens', {
            requestId: tokenReq._id,
            targetUserId: tokenReq.userId,
            targetUserEmail: tokenReq.userEmail
        }, req);

        res.json({
            success: true,
            message: 'Token request marked as rejected',
            request: tokenReq
        });
    } catch (err) {
        console.error('Error rejecting token request:', err);
        res.status(500).json({ error: 'Failed to reject token request' });
    }
});

module.exports = router;
