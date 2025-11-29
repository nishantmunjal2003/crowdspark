const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, index: true },
    participantName: String,
    questionIndex: Number,
    questionText: String,
    answer: String,
    isCorrect: Boolean,
    quizType: { type: String, enum: ['quiz', 'poll'] },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', ResponseSchema);
