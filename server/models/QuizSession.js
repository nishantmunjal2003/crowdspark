const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    socketId: { type: String },
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalAnswered: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    answers: [{
        questionIndex: { type: Number },
        questionText: { type: String },
        selectedOption: { type: String },
        answerText: { type: String },
        isCorrect: { type: Boolean },
        timestamp: { type: Date, default: Date.now }
    }]
});

const QuizSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    quizTitle: { type: String, required: true },
    quizType: { type: String, enum: ['quiz', 'poll'], default: 'quiz' },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalParticipants: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    participants: [ParticipantSchema],
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
