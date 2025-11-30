const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    id: String,
    text: String,
    options: [String],
    correctAnswer: String, // Optional for polls
    timeLimit: { type: Number, default: 30 },
    media: mongoose.Schema.Types.Mixed // Allow flexible media structure (null, base64, or URL)
});

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['quiz', 'poll'], default: 'quiz' },
    questions: [QuestionSchema],
    backgroundImage: String,
    music: String,
    theme: { type: String, default: 'default' }, // For future preset themes
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
    // In a real app, we would add: creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Quiz', QuizSchema);
