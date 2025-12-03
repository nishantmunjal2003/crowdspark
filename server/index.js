require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Models
const Quiz = require('./models/Quiz');
const Response = require('./models/Response');
const Otp = require('./models/Otp');
const User = require('./models/User');
const ActivityLog = require('./models/ActivityLog');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const { logActivity } = require('./middleware/activityLogger');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bcrypt = require('bcrypt');

// Nodemailer Transporter
// ... (keep existing transporter config)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const app = express();

// Middleware - MUST be before routes
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Enable JSON body parsing with larger limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Also increase URL-encoded body limit
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// --- Auth Endpoints ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      createdAt: user.createdAt
    };

    res.json({ success: true, message: 'Account created successfully', user: userResponse });
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
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

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({ success: true, message: 'Login successful', user: userResponse });
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
    if (user) {
      // Update googleId if missing
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        email,
        name,
        picture,
        googleId
      });
    }

    res.json({ success: true, message: 'Google login successful', user });
  } catch (err) {
    console.error('Error verifying Google token:', err);
    res.status(400).json({ error: 'Invalid Google token' });
  }
});

// Multer Configuration for File Uploads
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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL to access the file
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename, originalname: req.file.originalname });
});

// Admin Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for MVP
    methods: ["GET", "POST"]
  }
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

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB successfully');
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

// Get quizzes (optionally filtered by user)
app.get('/api/quizzes', async (req, res) => {
  try {
    const { userId } = req.query;

    // If userId is provided, filter by creator
    const filter = userId ? { creatorId: userId } : {};

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
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

// --- Socket.IO Logic ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- Host Events ---

  socket.on('create_session', (quizData, callback) => {
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    sessions[sessionId] = {
      id: sessionId,
      hostId: socket.id,
      quizData: quizData,
      currentQuestionIndex: -1, // -1 means waiting room
      participants: {}, // { socketId: { name, score, answers: {} } }
      state: 'waiting',
      questionActive: false
    };
    socket.join(sessionId);
    callback({ sessionId });
    console.log(`Session created: ${sessionId} by ${socket.id}`);
  });

  socket.on('start_quiz', ({ sessionId }) => {
    const session = sessions[sessionId];
    if (session && session.hostId === socket.id) {
      session.state = 'active';
      session.currentQuestionIndex = 0;
      session.questionActive = true;
      io.to(sessionId).emit('quiz_started');
      io.to(sessionId).emit('new_question', session.quizData.questions[0]);
      console.log(`Quiz started: ${sessionId}`);
    }
  });

  socket.on('next_question', ({ sessionId }) => {
    const session = sessions[sessionId];
    if (session && session.hostId === socket.id) {
      session.currentQuestionIndex++;
      if (session.currentQuestionIndex < session.quizData.questions.length) {
        session.questionActive = true;
        io.to(sessionId).emit('new_question', session.quizData.questions[session.currentQuestionIndex]);
      } else {
        session.state = 'finished';
        io.to(sessionId).emit('quiz_finished', getLeaderboard(session));
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

  socket.on('join_session', ({ sessionId, name }, callback) => {
    const session = sessions[sessionId];
    if (session) {
      session.participants[socket.id] = {
        name,
        score: 0,
        answers: {}
      };
      socket.join(sessionId);

      // Notify host of new participant
      io.to(session.hostId).emit('participant_joined', { name, total: Object.keys(session.participants).length });

      callback({
        success: true,
        state: session.state,
        theme: {
          backgroundImage: session.quizData.backgroundImage,
          // music: session.quizData.music // Optional: don't play music on participant devices by default
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
      const answerText = currentQuestion.options[answerIndex];
      const isCorrect = currentQuestion.correctAnswer === answerText;

      if (isCorrect) {
        participant.score += 10; // Simple scoring
      }

      // Store response in MongoDB
      try {
        await Response.create({
          sessionId,
          participantName: participant.name,
          questionIndex: currentQIndex,
          questionText: currentQuestion.text,
          answer: answer, // 'A', 'B', etc.
          isCorrect: isCorrect,
          quizType: session.quizData.type || 'quiz'
        });
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
  });
});

function getLeaderboard(session) {
  return Object.values(session.participants)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5
}

// --- Analytics API Endpoints (Updated to use MongoDB) ---

// Get all responses for a session
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

// Get analytics summary for a session
app.get('/api/analytics/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const responses = await Response.find({ sessionId });
    const session = sessions[sessionId]; // Still need session for quiz structure if active, OR fetch from DB if we stored sessions

    // Note: If session is closed, we might not have quizData in memory. 
    // Ideally, we should store the Session structure in DB too. 
    // For now, we'll assume we can calculate basic stats from responses alone or active session.

    // Basic analytics from responses
    const totalParticipants = new Set(responses.map(r => r.participantName)).size;

    res.json({
      sessionId,
      totalParticipants,
      totalResponses: responses.length,
      // More detailed analytics would require reconstructing the quiz structure or saving it
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export responses as CSV
app.get('/api/export/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const responses = await Response.find({ sessionId }).sort({ timestamp: 1 });

    if (responses.length === 0) {
      return res.status(404).json({ error: 'No responses found' });
    }

    // Generate CSV
    const headers = ['Participant Name', 'Question Index', 'Question', 'Answer', 'Is Correct', 'Timestamp'];
    const rows = responses.map(r => [
      r.participantName,
      r.questionIndex + 1,
      r.questionText,
      r.answer,
      r.isCorrect ? 'Yes' : 'No',
      r.timestamp.toISOString()
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="responses_${sessionId}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
