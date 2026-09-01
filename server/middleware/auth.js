const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('./activityLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'crowdspark_fallback_secret_key_2026';

/**
 * Generate signed JWT token for authenticated user
 */
function generateToken(user) {
    return jwt.sign(
        {
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user'
        },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

/**
 * Middleware to authenticate requests via JWT Bearer token,
 * with graceful fallback to userId for backward compatibility.
 */
async function authenticateToken(req, res, next) {
    try {
        let token = null;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        } else if (req.body && req.body.token) {
            token = req.body.token;
        }

        let userId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded._id;
            } catch (err) {
                console.warn('[Auth Middleware] Invalid/expired JWT token:', err.message);
            }
        }

        // Backward compatibility fallback to userId in body/query/headers
        if (!userId) {
            userId = req.query?.userId || req.body?.userId || req.headers['x-user-id'];
        }

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Authentication required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User account not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Forbidden: Your account has been deactivated' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('[Auth Middleware Error]:', err);
        res.status(500).json({ error: 'Internal authentication error' });
    }
}

/**
 * Middleware to verify Admin privileges
 */
async function requireAdmin(req, res, next) {
    try {
        let user = req.user;

        if (!user) {
            let userId = null;
            const authHeader = req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
                    userId = decoded._id;
                } catch (e) {
                    // ignore invalid token and check userId
                }
            }

            if (!userId) {
                userId = req.query?.userId || req.body?.userId || req.headers['x-user-id'];
            }

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: No user credentials provided' });
            }

            user = await User.findById(userId);
        }

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Forbidden: Account deactivated' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        // Log admin access audit
        await logActivity(user._id, user.email, user.name, 'admin_access', {
            path: req.path,
            method: req.method
        }, req);

        req.adminUser = user;
        req.user = user;
        next();
    } catch (err) {
        console.error('[Admin Auth Error]:', err);
        res.status(500).json({ error: 'Server authentication error' });
    }
}

module.exports = {
    generateToken,
    authenticateToken,
    requireAdmin
};
