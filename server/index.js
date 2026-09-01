require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Models & Services
const Quiz = require('./models/Quiz');
const Response = require('./models/Response');
const QuizSession = require('./models/QuizSession');
const Otp = require('./models/Otp');
const User = require('./models/User');
const ActivityLog = require('./models/ActivityLog');
const SystemSetting = require('./models/SystemSetting');
const TokenRequest = require('./models/TokenRequest');
const { sendOtpEmail, sendWelcomeEmail, sendTokenRequestAdminNotification } = require('./services/mailService');
const { OAuth2Client } = require('google-auth-library');
const { logActivity } = require('./middleware/activityLogger');
const { generateQuizFromAI } = require('./services/aiService');
const { generateToken, authenticateToken } = require('./middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bcrypt = require('bcrypt');

const app = express();

// Helper to get default AI tokens from settings
async function getDefaultAiTokens() {
  try {
    const setting = await SystemSetting.findOne({ key: 'defaultAiTokens' });
    if (setting && typeof setting.value === 'number') {
      return setting.value;
    }
  } catch (e) {
    console.error('Error reading defaultAiTokens setting:', e);
  }
  return 50;
}

// --- Security Middleware ---
// 1. Helmet HTTP Security Headers (allows cross-origin images for uploaded quiz assets)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS policy configuration
const allowedOrigins = [
  'https://crowdspark.nishantmunjal.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.nishantmunjal.com')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev to avoid breaking any custom host setups
  },
  credentials: true
}));

// 3. Rate Limiters
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again later.' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6, // max 6 OTP requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification code requests. Please wait 15 minutes before requesting again.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // max 15 login attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' }
});

const aiGenerationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20, // max 20 AI generations per 5 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI generation rate limit reached. Please wait a few moments before generating more questions.' }
});

app.use('/api/', generalApiLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// --- Auth Endpoints ---

// Send Signup OTP (protected with OTP rate limiter)
app.post('/api/auth/send-signup-otp', otpLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account already exists with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (overwrites any previous OTP for this email)
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({ email: normalizedEmail, otp });

    // Send verification email via ZeptoMail / SMTP
    const mailResult = await sendOtpEmail(normalizedEmail, name.trim(), otp);
    console.log(`[Signup OTP] Email dispatch result for ${normalizedEmail}:`, mailResult);

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (err) {
    console.error('Error sending signup OTP:', err);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify Signup OTP and Create Account
app.post('/api/auth/verify-signup-otp', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ error: 'All fields including verification code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const otpRecord = await Otp.findOne({ email: normalizedEmail, otp: otp.trim() });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultTokens = await getDefaultAiTokens();

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      aiTokens: defaultTokens,
      aiTokensUsed: 0,
      aiTokensTotal: defaultTokens
    });

    // Delete used OTP
    await Otp.deleteMany({ email: normalizedEmail });

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('[Welcome Email Error]:', err);
    });

    // Log activity
    await logActivity(user._id, user.email, user.name, 'signup', { method: 'email_otp' }, req);

    // Return user session object with signed JWT token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      aiTokens: user.aiTokens,
      aiTokensUsed: user.aiTokensUsed,
      aiTokensTotal: user.aiTokensTotal,
      createdAt: user.createdAt
    };

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Account verified and created successfully',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Error verifying signup OTP:', err);
    res.status(500).json({ error: 'Failed to verify code and create account' });
  }
});

// Direct Signup (legacy / fallback)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultTokens = await getDefaultAiTokens();

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      aiTokens: defaultTokens,
      aiTokensUsed: 0,
      aiTokensTotal: defaultTokens
    });

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('[Welcome Email Error]:', err);
    });

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      aiTokens: user.aiTokens,
      aiTokensUsed: user.aiTokensUsed,
      aiTokensTotal: user.aiTokensTotal,
      createdAt: user.createdAt
    };

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login (protected with login rate limiter)
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    // Check if user has a password (might be Google-only user)
    if (!user.password) {
      return res.status(400).json({ error: 'Please use Google Sign-In for this account' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    await logActivity(user._id, user.email, user.name, 'login', { method: 'email' }, req);

    // Return user without password + signed JWT token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      aiTokens: user.aiTokens !== undefined ? user.aiTokens : 50,
      aiTokensUsed: user.aiTokensUsed || 0,
      aiTokensTotal: user.aiTokensTotal || 50,
      createdAt: user.createdAt
    };

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Google Sign-In
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credential is required' });

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or Create User
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      }
      // Update googleId if missing
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
    } else {
      const defaultTokens = await getDefaultAiTokens();
      user = await User.create({
        email,
        name,
        picture,
        googleId,
        aiTokens: defaultTokens,
        aiTokensUsed: 0,
        aiTokensTotal: defaultTokens
      });
      isNewUser = true;

      // Send Welcome Email asynchronously for new Google signups
      sendWelcomeEmail(user.email, user.name).catch(err => {
        console.error('[Welcome Email Error]:', err);
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    await logActivity(user._id, user.email, user.name, isNewUser ? 'google_signup' : 'google_login', { email }, req);

    // Return user without password + signed JWT token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      aiTokens: user.aiTokens !== undefined ? user.aiTokens : 50,
      aiTokensUsed: user.aiTokensUsed || 0,
      aiTokensTotal: user.aiTokensTotal || 50,
      createdAt: user.createdAt
    };

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Error verifying Google token:', err);
    res.status(400).json({ error: 'Invalid Google token' });
  }
});

// Multer Configuration for File Uploads (Strict 5MB Limit & Image MIME Filter)
const multer = require('multer');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const MAX_UPLOAD_SIZE = (parseInt(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024; // 5MB

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPG, PNG, WEBP, and GIF images are allowed.'));
    }
  }
});

// Upload Endpoint with Error Handling for 5MB Limit & File Format
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds the 5MB limit. Please upload a smaller image.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });
  });
});

// Admin Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for MVP
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000, // 60 seconds tolerance for mobile sleep/backgrounding
  pingInterval: 25000  // 25 seconds ping interval
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set!');
  console.error('Please create a .env file in the server directory with:');
  console.error('MONGODB_URI=mongodb://localhost:27017/crowdspark');
  console.error('or your MongoDB Atlas connection string');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
console.log('Connection string:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password in logs

mongoose.connect(MONGODB_URI, {
  maxPoolSize: 100,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✓ Connected to MongoDB successfully (Pool Size: 100)');
    console.log('  Database:', mongoose.connection.name);
    console.log('  Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    console.error('  Please ensure MongoDB is running and the connection string is correct');
    console.error('  Connection string:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✓ MongoDB reconnected');
});

// In-memory storage for active sessions (for speed)
const sessions = {}; // { sessionId: { quizData, currentQuestionIndex, participants: {}, state: 'waiting'|'active'|'finished' } }

// --- API Endpoints ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'ok',
    mongodb: {
      status: statusMap[mongoStatus] || 'unknown',
      readyState: mongoStatus
    },
    timestamp: new Date().toISOString()
  });
});

// Config endpoint for client-side settings
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ""
  });
});

// Get user AI token balance
app.get('/api/users/:id/tokens', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('aiTokens aiTokensUsed aiTokensTotal email name');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      success: true,
      aiTokens: user.aiTokens !== undefined ? user.aiTokens : 50,
      aiTokensUsed: user.aiTokensUsed || 0,
      aiTokensTotal: user.aiTokensTotal || 50
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile & refresh session
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        isActive: user.isActive,
        aiTokens: user.aiTokens !== undefined ? user.aiTokens : 50,
        aiTokensUsed: user.aiTokensUsed || 0,
        aiTokensTotal: user.aiTokensTotal || 50,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (Name & Picture only - email cannot be changed)
app.put('/api/users/:id/profile', async (req, res) => {
  try {
    const { name, picture } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    const updates = {
      name: name.trim()
    };

    if (picture !== undefined) {
      updates.picture = picture;
    }

    // Explicitly prevent email or role tampering from user profile endpoint
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await logActivity(user._id, user.email, user.name, 'profile_updated', {
      newName: user.name
    }, req);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        isActive: user.isActive,
        aiTokens: user.aiTokens !== undefined ? user.aiTokens : 50,
        aiTokensUsed: user.aiTokensUsed || 0,
        aiTokensTotal: user.aiTokensTotal || 50,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// User Token Request Endpoint ($1 for 50 tokens)
app.post('/api/tokens/request', async (req, res) => {
  try {
    const { userId, tokensRequested = 50, amount = 1, note = '' } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const numTokens = parseInt(tokensRequested) || 50;
    const numAmount = parseFloat(amount) || 1;

    // Create Token Request record
    const tokenReq = await TokenRequest.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      tokensRequested: numTokens,
      amount: numAmount,
      note: note.trim(),
      status: 'pending'
    });

    // Log Activity
    await logActivity(user._id, user.email, user.name, 'user_request_tokens', {
      requestId: tokenReq._id,
      tokensRequested: numTokens,
      amount: numAmount
    }, req);

    // Notify Admins asynchronously via email
    try {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        sendTokenRequestAdminNotification(admin.email, {
          userName: user.name,
          userEmail: user.email,
          tokensRequested: numTokens,
          amount: numAmount,
          note: note.trim()
        }).catch(err => console.error('[Token Request Admin Email Error]:', err));
      }
    } catch (adminErr) {
      console.error('Error sending admin notification for token request:', adminErr);
    }

    res.json({
      success: true,
      message: `Token request for ${numTokens} AI Tokens ($${numAmount}) submitted successfully! Admin has been notified.`,
      request: tokenReq
    });
  } catch (err) {
    console.error('Error creating token request:', err);
    res.status(500).json({ error: 'Failed to submit token request' });
  }
});

// Get User's Token Request History
app.get('/api/tokens/my-requests', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    const requests = await TokenRequest.find({ userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      requests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Quiz Generation endpoint with token quota enforcement & rate limiting
app.post('/api/ai/generate-quiz', aiGenerationLimiter, async (req, res) => {
  try {
    const { topic, numQuestions, difficulty, userId } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Topic prompt is required' });
    }

    const requestedQuestions = parseInt(numQuestions) || 5;

    // Verify AI Token quota if userId is provided
    let userDoc = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      userDoc = await User.findById(userId);
      if (userDoc) {
        const currentTokens = userDoc.aiTokens !== undefined ? userDoc.aiTokens : 50;
        if (currentTokens < requestedQuestions) {
          return res.status(403).json({
            error: `Insufficient AI tokens. You requested ${requestedQuestions} questions, but only have ${currentTokens} token${currentTokens === 1 ? '' : 's'} remaining.`,
            insufficientTokens: true,
            tokensRemaining: currentTokens,
            tokensNeeded: requestedQuestions
          });
        }
      }
    }

    const quizData = await generateQuizFromAI(
      topic,
      requestedQuestions,
      difficulty || 'Medium'
    );

    // Deduct tokens on successful AI generation
    let tokensRemaining = null;
    if (userDoc) {
      const actualQuestionsCount = quizData.questions?.length || requestedQuestions;
      userDoc.aiTokens = Math.max(0, (userDoc.aiTokens !== undefined ? userDoc.aiTokens : 50) - actualQuestionsCount);
      userDoc.aiTokensUsed = (userDoc.aiTokensUsed || 0) + actualQuestionsCount;
      await userDoc.save();
      tokensRemaining = userDoc.aiTokens;

      await logActivity(userDoc._id, userDoc.email, userDoc.name, 'ai_quiz_generated', {
        topic,
        questionsCount: actualQuestionsCount,
        tokensDeducted: actualQuestionsCount,
        tokensRemaining: userDoc.aiTokens
      }, req);
    }

    res.json({
      ...quizData,
      tokensRemaining,
      tokensDeducted: quizData.questions?.length || requestedQuestions
    });
  } catch (err) {
    console.error('AI Generation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz with AI' });
  }
});

// Save a new quiz
app.post('/api/quizzes', async (req, res) => {
  try {
    console.log('Received quiz data:', JSON.stringify(req.body, null, 2));
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    // Ensure creatorId is provided
    if (!req.body.creatorId) {
      return res.status(400).json({ error: 'creatorId is required' });
    }

    const quiz = new Quiz(req.body);
    console.log('Quiz model created, attempting to save...');

    await quiz.save();
    console.log('Quiz saved successfully:', quiz._id);

    // Log activity
    await logActivity(
      req.body.creatorId,
      req.body.creatorEmail || 'unknown',
      req.body.creatorName || 'User',
      'quiz_created',
      { quizId: quiz._id, title: quiz.title },
      req
    );

    res.status(201).json(quiz);
  } catch (err) {
    console.error('Error saving quiz:', err);
    res.status(400).json({
      error: err.message,
      details: err.stack,
      mongoStatus: mongoose.connection.readyState
    });
  }
});

// Get quizzes (optionally filtered by user) with participants & plays statistics
app.get('/api/quizzes', async (req, res) => {
  try {
    const { userId } = req.query;

    // If userId is provided, filter by creator
    const filter = userId ? { creatorId: userId } : {};

    const rawQuizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    // Aggregate sessions for these quizzes to compute totalParticipants and totalPlays
    const quizIds = rawQuizzes.map(q => q._id);
    const sessionAgg = await QuizSession.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      {
        $group: {
          _id: '$quizId',
          totalPlays: { $sum: 1 },
          totalParticipants: { $sum: '$totalParticipants' },
          lastPlayed: { $max: '$startedAt' }
        }
      }
    ]);

    const statsMap = {};
    sessionAgg.forEach(s => {
      statsMap[s._id.toString()] = {
        totalPlays: s.totalPlays || 0,
        totalParticipants: s.totalParticipants || 0,
        lastPlayed: s.lastPlayed
      };
    });

    const quizzes = rawQuizzes.map(q => {
      const qObj = q.toObject();
      const stats = statsMap[q._id.toString()] || { totalPlays: 0, totalParticipants: 0, lastPlayed: null };
      return {
        ...qObj,
        totalPlays: stats.totalPlays,
        totalParticipants: stats.totalParticipants,
        lastPlayed: stats.lastPlayed
      };
    });

    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific quiz
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a quiz
app.put('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Log activity
    const userId = req.body.creatorId || quiz.creatorId;
    const userEmail = req.body.creatorEmail || quiz.creatorEmail;
    const userName = req.body.creatorName || 'User';

    await logActivity(
      userId,
      userEmail,
      userName,
      'quiz_updated',
      { quizId: quiz._id, title: quiz.title },
      req
    );

    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a quiz
app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    console.log('Deleting quiz with ID:', req.params.id);
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      console.log('Quiz not found:', req.params.id);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    console.log('Quiz deleted successfully:', req.params.id);

    // Log activity
    if (quiz.creatorId) {
      await logActivity(
        quiz.creatorId,
        quiz.creatorEmail || 'unknown',
        'User',
        'quiz_deleted',
        { quizId: quiz._id, title: quiz.title },
        req
      );
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({ error: err.message });
  }
});

// Quick update quiz group
app.patch('/api/quizzes/:id/group', async (req, res) => {
  try {
    const { group = 'General' } = req.body;
    const cleanGroup = group.trim() || 'General';
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { group: cleanGroup, updatedAt: new Date() },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rename a group across all quizzes for a user
app.post('/api/quizzes/rename-group', async (req, res) => {
  try {
    const { userId, oldGroup, newGroup } = req.body;
    if (!userId || !oldGroup || !newGroup) {
      return res.status(400).json({ error: 'userId, oldGroup, and newGroup are required' });
    }
    const result = await Quiz.updateMany(
      { creatorId: userId, group: oldGroup.trim() },
      { $set: { group: newGroup.trim(), updatedAt: new Date() } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Socket.IO Logic ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- Host Events ---

  socket.on('create_session', async (payload, callback) => {
    let quiz = payload;
    let existingSessionId = null;

    if (payload && payload.quizData) {
      quiz = payload.quizData;
      existingSessionId = payload.existingSessionId;
    }

    if (existingSessionId && sessions[existingSessionId]) {
      const session = sessions[existingSessionId];
      session.hostId = socket.id;
      socket.join(existingSessionId);

      const participantList = Object.values(session.participants).map(p => ({
        name: p.name
      }));

      callback({
        sessionId: existingSessionId,
        reclaimed: true,
        participants: participantList,
        state: session.state,
        currentQuestionIndex: session.currentQuestionIndex
      });
      console.log(`[Host Reclaim] Session ${existingSessionId} reclaimed by host ${socket.id}`);
      return;
    }

    const sessionId = existingSessionId || Math.random().toString(36).substring(2, 8).toUpperCase();
    sessions[sessionId] = {
      id: sessionId,
      hostId: socket.id,
      quizData: quiz,
      currentQuestionIndex: -1, // -1 means waiting room
      participants: {}, // { socketId: { name, score, answers: {} } }
      state: 'waiting',
      questionActive: false
    };
    socket.join(sessionId);

    // Persist QuizSession in MongoDB
    try {
      const qId = quiz._id || quiz.id;
      if (qId && mongoose.Types.ObjectId.isValid(qId)) {
        await QuizSession.findOneAndUpdate(
          { sessionId },
          {
            sessionId,
            quizId: new mongoose.Types.ObjectId(qId),
            quizTitle: quiz.title || 'Untitled Quiz',
            quizType: quiz.type || 'quiz',
            hostId: (quiz.creatorId && mongoose.Types.ObjectId.isValid(quiz.creatorId)) ? new mongoose.Types.ObjectId(quiz.creatorId) : undefined,
            totalQuestions: quiz.questions?.length || 0,
            status: 'waiting',
            startedAt: new Date()
          },
          { upsert: true, new: true }
        );
      }
    } catch (dbErr) {
      console.error('Error persisting QuizSession in MongoDB:', dbErr);
    }

    callback({ sessionId, reclaimed: false, participants: [] });
    console.log(`Session created: ${sessionId} by ${socket.id}`);
  });

  socket.on('start_quiz', async ({ sessionId }) => {
    const session = sessions[sessionId];
    if (session && session.hostId === socket.id) {
      session.state = 'active';
      session.currentQuestionIndex = 0;
      session.questionActive = true;
      io.to(sessionId).emit('quiz_started');
      io.to(sessionId).emit('new_question', session.quizData.questions[0]);
      console.log(`Quiz started: ${sessionId}`);

      try {
        await QuizSession.updateOne(
          { sessionId },
          { $set: { status: 'active', startedAt: new Date() } }
        );
      } catch (err) {
        console.error('Error updating QuizSession on start:', err);
      }
    }
  });

  socket.on('next_question', async ({ sessionId }) => {
    const session = sessions[sessionId];
    if (session && session.hostId === socket.id) {
      session.currentQuestionIndex++;
      if (session.currentQuestionIndex < session.quizData.questions.length) {
        session.questionActive = true;
        io.to(sessionId).emit('new_question', session.quizData.questions[session.currentQuestionIndex]);
      } else {
        session.state = 'finished';
        io.to(sessionId).emit('quiz_finished', getLeaderboard(session));

        try {
          await QuizSession.updateOne(
            { sessionId },
            { $set: { status: 'completed', endedAt: new Date() } }
          );
        } catch (err) {
          console.error('Error marking QuizSession completed:', err);
        }
      }
    }
  });

  socket.on('show_results', ({ sessionId }) => {
    const session = sessions[sessionId];
    if (session && session.hostId === socket.id) {
      // Calculate stats for the current question
      const currentQIndex = session.currentQuestionIndex;
      const stats = { A: 0, B: 0, C: 0, D: 0 };

      Object.values(session.participants).forEach(p => {
        const ans = p.answers[currentQIndex];
        if (ans && stats[ans] !== undefined) {
          stats[ans]++;
        }
      });

      session.questionActive = false; // Stop accepting answers
      io.to(sessionId).emit('question_results', stats);
    }
  });

  // --- Participant Events ---

  socket.on('join_session', async ({ sessionId, name }, callback) => {
    const session = sessions[sessionId];
    if (session) {
      // Check for reconnection (same name, different socket ID)
      let oldSocketId = null;
      let existingScore = 0;
      let existingAnswers = {};

      for (const [sId, p] of Object.entries(session.participants)) {
        if (p.name.trim().toLowerCase() === name.trim().toLowerCase()) {
          oldSocketId = sId;
          existingScore = p.score;
          existingAnswers = p.answers;
          if (p.disconnectTimer) {
            clearTimeout(p.disconnectTimer);
          }
          break;
        }
      }

      if (oldSocketId) {
        delete session.participants[oldSocketId];
        console.log(`[Reconnection] Participant ${name} reconnected (moved socket ${oldSocketId} -> ${socket.id})`);
      }

      session.participants[socket.id] = {
        name,
        score: existingScore,
        answers: existingAnswers,
        connected: true,
        disconnectTimer: null
      };
      socket.join(sessionId);

      // Persist participant in QuizSession
      try {
        const participantObj = {
          name: name.trim(),
          socketId: socket.id,
          score: existingScore,
          joinedAt: new Date(),
          answers: []
        };

        const sessionDoc = await QuizSession.findOne({ sessionId });
        if (sessionDoc) {
          const exists = sessionDoc.participants.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
          if (!exists) {
            await QuizSession.updateOne(
              { sessionId },
              {
                $push: { participants: participantObj },
                $inc: { totalParticipants: 1 }
              }
            );
          }
        }
      } catch (dbErr) {
        console.error('Error adding participant to QuizSession:', dbErr);
      }

      // Notify host of participant
      io.to(session.hostId).emit('participant_joined', { name, total: Object.keys(session.participants).length });

      const currentQ = (session.state === 'active' && session.currentQuestionIndex >= 0)
        ? session.quizData.questions[session.currentQuestionIndex]
        : null;

      callback({
        success: true,
        state: session.state,
        currentQuestion: currentQ,
        currentQuestionIndex: session.currentQuestionIndex,
        questionActive: session.questionActive,
        theme: {
          backgroundImage: session.quizData ? session.quizData.backgroundImage : null,
        }
      });
      console.log(`${name} joined session ${sessionId}`);
    } else {
      callback({ success: false, message: 'Session not found' });
    }
  });

  socket.on('submit_answer', async ({ sessionId, answer }) => {
    const session = sessions[sessionId];
    if (session && session.participants[socket.id]) {
      if (!session.questionActive) return; // Prevent answering if question is closed

      const currentQIndex = session.currentQuestionIndex;
      const participant = session.participants[socket.id];

      // Record answer locally
      participant.answers[currentQIndex] = answer;

      // Check correctness
      const currentQuestion = session.quizData.questions[currentQIndex];
      const answerIndex = answer.charCodeAt(0) - 65; // Convert A, B, C, D to 0, 1, 2, 3
      const answerText = currentQuestion.options ? currentQuestion.options[answerIndex] : answer;
      const isCorrect = currentQuestion.correctAnswer === answerText;

      if (isCorrect) {
        participant.score += 10; // Simple scoring
      }

      // Store response in MongoDB
      try {
        const qId = session.quizData?._id || session.quizData?.id;
        await Response.create({
          sessionId,
          quizId: (qId && mongoose.Types.ObjectId.isValid(qId)) ? new mongoose.Types.ObjectId(qId) : undefined,
          participantName: participant.name,
          questionIndex: currentQIndex,
          questionText: currentQuestion.text,
          answer: answer,
          isCorrect: isCorrect,
          quizType: session.quizData?.type || 'quiz'
        });

        // Update QuizSession participant
        await QuizSession.updateOne(
          { sessionId, "participants.name": participant.name },
          {
            $set: { "participants.$.score": participant.score },
            $inc: {
              "participants.$.totalAnswered": 1,
              ...(isCorrect ? { "participants.$.correctAnswers": 1 } : {})
            },
            $push: {
              "participants.$.answers": {
                questionIndex: currentQIndex,
                questionText: currentQuestion.text,
                selectedOption: answer,
                answerText: answerText,
                isCorrect: isCorrect,
                timestamp: new Date()
              }
            }
          }
        );
      } catch (err) {
        console.error('Error saving response to MongoDB:', err);
      }

      // Calculate live stats
      const stats = { A: 0, B: 0, C: 0, D: 0 };
      Object.values(session.participants).forEach(p => {
        const ans = p.answers[currentQIndex];
        if (ans && stats[ans] !== undefined) {
          stats[ans]++;
        }
      });

      // Notify host with live stats
      io.to(session.hostId).emit('live_stats_update', stats);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Find and clean up participant if disconnected in the waiting room
    for (const sessionId in sessions) {
      const session = sessions[sessionId];
      if (session.participants[socket.id]) {
        const participant = session.participants[socket.id];
        const participantName = participant.name;
        participant.connected = false;

        // If the quiz hasn't started yet, apply grace period before removing
        if (session.state === 'waiting') {
          if (participant.disconnectTimer) {
            clearTimeout(participant.disconnectTimer);
          }

          // 2 minute (120,000 ms) grace period to allow mobile screens to wake up or reconnect
          participant.disconnectTimer = setTimeout(() => {
            if (session.participants[socket.id] && !session.participants[socket.id].connected) {
              delete session.participants[socket.id];
              io.to(session.hostId).emit('participant_left', { name: participantName, total: Object.keys(session.participants).length });
              console.log(`${participantName} removed from session ${sessionId} after grace period timeout`);
            }
          }, 120000);

          console.log(`${participantName} disconnected from session ${sessionId} (grace period active)`);
        }
        break;
      }
    }
  });
});

function getLeaderboard(session) {
  return Object.values(session.participants)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

// --- Analytics & Report Endpoints ---

// Get detailed analytics and session history for a specific quiz
app.get('/api/quizzes/:id/analytics', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const sessions = await QuizSession.find({ quizId: quiz._id })
      .sort({ startedAt: -1 });

    // Calculate overall totals across all sessions
    let totalParticipants = 0;
    const uniqueParticipantSet = new Set();
    let totalScoreSum = 0;
    let participantCountWithScores = 0;

    const formattedSessions = sessions.map(s => {
      const pList = (s.participants || []).map(p => {
        uniqueParticipantSet.add(p.name.trim().toLowerCase());
        totalParticipants++;
        if (p.score !== undefined) {
          totalScoreSum += p.score;
          participantCountWithScores++;
        }

        const totalQ = p.totalAnswered || (p.answers ? p.answers.length : 0);
        const correctQ = p.correctAnswers || (p.answers ? p.answers.filter(a => a.isCorrect).length : 0);
        const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;

        return {
          _id: p._id,
          name: p.name,
          score: p.score || 0,
          correctAnswers: correctQ,
          totalAnswered: totalQ,
          accuracy: accuracy,
          joinedAt: p.joinedAt,
          answers: p.answers || []
        };
      });

      return {
        _id: s._id,
        sessionId: s.sessionId,
        startedAt: s.startedAt || s.createdAt,
        endedAt: s.endedAt,
        status: s.status,
        totalParticipants: s.totalParticipants || pList.length,
        participants: pList.sort((a, b) => b.score - a.score)
      };
    });

    const averageScore = participantCountWithScores > 0
      ? Math.round(totalScoreSum / participantCountWithScores)
      : 0;

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        type: quiz.type,
        totalQuestions: quiz.questions?.length || 0,
        questions: quiz.questions,
        createdAt: quiz.createdAt
      },
      totalPlays: sessions.length,
      totalParticipants: totalParticipants,
      uniqueParticipantsCount: uniqueParticipantSet.size,
      averageScore,
      sessions: formattedSessions
    });
  } catch (err) {
    console.error('Error fetching quiz analytics:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export comprehensive CSV report for a Quiz (all sessions & participants)
app.get('/api/quizzes/:id/export', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const sessions = await QuizSession.find({ quizId: quiz._id }).sort({ startedAt: -1 });

    const headers = [
      'Quiz Title',
      'Session Code',
      'Session Date & Time',
      'Participant Name',
      'Total Score',
      'Correct Answers',
      'Questions Answered',
      'Accuracy (%)',
      'Question Number',
      'Question Text',
      'Selected Option',
      'Correct / Wrong',
      'Answer Timestamp'
    ];

    const rows = [];

    sessions.forEach(session => {
      const sessionDate = (session.startedAt || session.createdAt)
        ? new Date(session.startedAt || session.createdAt).toLocaleString()
        : 'N/A';

      if (!session.participants || session.participants.length === 0) {
        rows.push([
          quiz.title,
          session.sessionId,
          sessionDate,
          'No participants recorded',
          '0',
          '0',
          '0',
          '0%',
          '-',
          '-',
          '-',
          '-',
          '-'
        ]);
        return;
      }

      session.participants.forEach(p => {
        const totalQ = p.totalAnswered || (p.answers ? p.answers.length : 0);
        const correctQ = p.correctAnswers || (p.answers ? p.answers.filter(a => a.isCorrect).length : 0);
        const accuracy = totalQ > 0 ? `${Math.round((correctQ / totalQ) * 100)}%` : '0%';

        if (!p.answers || p.answers.length === 0) {
          rows.push([
            quiz.title,
            session.sessionId,
            sessionDate,
            p.name,
            p.score || 0,
            correctQ,
            totalQ,
            accuracy,
            '-',
            '-',
            '-',
            '-',
            p.joinedAt ? new Date(p.joinedAt).toLocaleString() : '-'
          ]);
        } else {
          p.answers.forEach(ans => {
            rows.push([
              quiz.title,
              session.sessionId,
              sessionDate,
              p.name,
              p.score || 0,
              correctQ,
              totalQ,
              accuracy,
              (ans.questionIndex !== undefined ? ans.questionIndex + 1 : '-'),
              ans.questionText || '-',
              ans.selectedOption || ans.answerText || '-',
              ans.isCorrect ? 'Correct' : 'Incorrect',
              ans.timestamp ? new Date(ans.timestamp).toLocaleString() : '-'
            ]);
          });
        }
      });
    });

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const cleanTitle = quiz.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Report_${cleanTitle}_${Date.now()}.csv"`);
    res.send('\uFEFF' + csvContent); // Include BOM for Excel compatibility
  } catch (err) {
    console.error('Error exporting quiz report:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export single session CSV report
app.get('/api/sessions/:sessionId/export', async (req, res) => {
  try {
    const session = await QuizSession.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      // Fallback: check Response collection
      const responses = await Response.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
      if (responses.length === 0) {
        return res.status(404).json({ error: 'Session report not found' });
      }

      const headers = ['Session Code', 'Participant Name', 'Question #', 'Question', 'Selected Answer', 'Is Correct', 'Timestamp'];
      const rows = responses.map(r => [
        req.params.sessionId,
        r.participantName,
        r.questionIndex + 1,
        r.questionText,
        r.answer,
        r.isCorrect ? 'Correct' : 'Incorrect',
        new Date(r.timestamp).toLocaleString()
      ]);
      const csv = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="Session_${req.params.sessionId}_Report.csv"`);
      return res.send('\uFEFF' + csv);
    }

    const headers = [
      'Quiz Title',
      'Session Code',
      'Session Date & Time',
      'Participant Name',
      'Total Score',
      'Correct Answers',
      'Total Questions Answered',
      'Accuracy (%)',
      'Question #',
      'Question Text',
      'Selected Option',
      'Result',
      'Timestamp'
    ];

    const sessionDate = (session.startedAt || session.createdAt)
      ? new Date(session.startedAt || session.createdAt).toLocaleString()
      : 'N/A';

    const rows = [];
    (session.participants || []).forEach(p => {
      const totalQ = p.totalAnswered || (p.answers ? p.answers.length : 0);
      const correctQ = p.correctAnswers || (p.answers ? p.answers.filter(a => a.isCorrect).length : 0);
      const accuracy = totalQ > 0 ? `${Math.round((correctQ / totalQ) * 100)}%` : '0%';

      if (!p.answers || p.answers.length === 0) {
        rows.push([
          session.quizTitle,
          session.sessionId,
          sessionDate,
          p.name,
          p.score || 0,
          correctQ,
          totalQ,
          accuracy,
          '-',
          '-',
          '-',
          '-',
          p.joinedAt ? new Date(p.joinedAt).toLocaleString() : '-'
        ]);
      } else {
        p.answers.forEach(ans => {
          rows.push([
            session.quizTitle,
            session.sessionId,
            sessionDate,
            p.name,
            p.score || 0,
            correctQ,
            totalQ,
            accuracy,
            (ans.questionIndex !== undefined ? ans.questionIndex + 1 : '-'),
            ans.questionText || '-',
            ans.selectedOption || ans.answerText || '-',
            ans.isCorrect ? 'Correct' : 'Incorrect',
            ans.timestamp ? new Date(ans.timestamp).toLocaleString() : '-'
          ]);
        });
      }
    });

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Session_${session.sessionId}_Report.csv"`);
    res.send('\uFEFF' + csvContent);
  } catch (err) {
    console.error('Error exporting session report:', err);
    res.status(500).json({ error: err.message });
  }
});

// Legacy response endpoints for backward compatibility
app.get('/api/responses/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const responses = await Response.find({ sessionId }).sort({ timestamp: 1 });
    res.json({
      sessionId,
      totalResponses: responses.length,
      responses: responses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const responses = await Response.find({ sessionId });
    const totalParticipants = new Set(responses.map(r => r.participantName)).size;
    res.json({
      sessionId,
      totalParticipants,
      totalResponses: responses.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export/:sessionId', async (req, res) => {
  res.redirect(`/api/sessions/${req.params.sessionId}/export`);
});

// --- Production Setup ---

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
