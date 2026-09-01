require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Response = require('../models/Response');
const Quiz = require('../models/Quiz');
const QuizSession = require('../models/QuizSession');

async function backfill() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for backfill...');

        const responses = await Response.find().sort({ timestamp: 1 });
        console.log(`Found ${responses.length} responses to analyze.`);

        const sessionMap = {};
        for (const r of responses) {
            if (!r.sessionId) continue;
            if (!sessionMap[r.sessionId]) {
                sessionMap[r.sessionId] = {
                    sessionId: r.sessionId,
                    quizType: r.quizType || 'quiz',
                    startedAt: r.timestamp,
                    endedAt: r.timestamp,
                    participants: {}
                };
            }

            const sess = sessionMap[r.sessionId];
            sess.endedAt = r.timestamp;

            const pName = (r.participantName || 'Anonymous').trim();
            if (!sess.participants[pName]) {
                sess.participants[pName] = {
                    name: pName,
                    score: 0,
                    correctAnswers: 0,
                    totalAnswered: 0,
                    joinedAt: r.timestamp,
                    answers: []
                };
            }

            const p = sess.participants[pName];
            p.totalAnswered++;
            if (r.isCorrect) {
                p.score += 10;
                p.correctAnswers++;
            }
            p.answers.push({
                questionIndex: r.questionIndex || 0,
                questionText: r.questionText || '',
                selectedOption: r.answer || '',
                isCorrect: !!r.isCorrect,
                timestamp: r.timestamp
            });
        }

        const quizzes = await Quiz.find();
        console.log(`Found ${quizzes.length} existing quizzes.`);

        let inserted = 0;
        for (const [sId, sessData] of Object.entries(sessionMap)) {
            const existing = await QuizSession.findOne({ sessionId: sId });
            if (existing) continue;

            // Try to match quiz by questionText
            let matchedQuiz = null;
            const firstQuestionText = sessData.participants && Object.values(sessData.participants)[0]?.answers[0]?.questionText;
            if (firstQuestionText) {
                matchedQuiz = quizzes.find(q => q.questions && q.questions.some(qn => qn.text === firstQuestionText));
            }
            if (!matchedQuiz && quizzes.length > 0) {
                matchedQuiz = quizzes[0];
            }

            if (matchedQuiz) {
                const pList = Object.values(sessData.participants);
                await QuizSession.create({
                    sessionId: sId,
                    quizId: matchedQuiz._id,
                    quizTitle: matchedQuiz.title,
                    quizType: sessData.quizType,
                    hostId: matchedQuiz.creatorId,
                    totalParticipants: pList.length,
                    totalQuestions: matchedQuiz.questions?.length || 0,
                    participants: pList,
                    startedAt: sessData.startedAt,
                    endedAt: sessData.endedAt,
                    status: 'completed',
                    createdAt: sessData.startedAt
                });
                inserted++;
            }
        }

        console.log(`Successfully backfilled ${inserted} quiz sessions into MongoDB.`);
        await mongoose.disconnect();
    } catch (err) {
        console.error('Backfill error:', err);
    }
}

backfill();
