import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Check, Upload, Download, Image, Video, X, Music, Palette, Clock, Sparkles, Zap } from 'lucide-react';

export default function CreateQuiz() {
    const navigate = useNavigate();
    const location = useLocation();
    const editingQuiz = location.state?.quiz;
    const quizType = location.state?.type || editingQuiz?.type || 'quiz';

    const [currentUser, setCurrentUser] = useState(null);
    const [userTokens, setUserTokens] = useState({ aiTokens: 50, aiTokensUsed: 0 });
    const [quizTitle, setQuizTitle] = useState(editingQuiz?.title || '');
    const [questions, setQuestions] = useState(editingQuiz?.questions || []);
    const [backgroundImage, setBackgroundImage] = useState(editingQuiz?.backgroundImage || '');
    const [music, setMusic] = useState(editingQuiz?.music || '');
    const [timeLimit, setTimeLimit] = useState(editingQuiz?.questions?.[0]?.timeLimit || 10);
    const [error, setError] = useState('');

    // AI Quiz Generation states
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiNumQuestions, setAiNumQuestions] = useState(5);
    const [aiDifficulty, setAiDifficulty] = useState('Medium');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    useEffect(() => {
        // Check if user is logged in
        const userStr = localStorage.getItem('current_user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(userStr);
        setCurrentUser(userData);

        // Fetch fresh user token balance
        fetch(`/api/users/${userData._id}/tokens`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUserTokens({
                        aiTokens: data.aiTokens !== undefined ? data.aiTokens : 50,
                        aiTokensUsed: data.aiTokensUsed || 0
                    });
                }
            })
            .catch(err => console.error('Error loading user tokens:', err));
    }, [navigate]);

    const handleAIGenerate = async () => {
        if (!aiTopic.trim()) {
            setAiError('Please enter a topic or prompt');
            return;
        }

        if ((userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) < aiNumQuestions) {
            setAiError(`Insufficient tokens. You need ${aiNumQuestions} tokens, but only have ${userTokens.aiTokens || 0} tokens remaining.`);
            return;
        }

        setAiLoading(true);
        setAiError('');

        try {
            const res = await fetch('/api/ai/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: aiTopic,
                    numQuestions: aiNumQuestions,
                    difficulty: aiDifficulty,
                    userId: currentUser?._id
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to generate quiz');
            }

            const data = await res.json();

            if (data.title) setQuizTitle(data.title);
            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
            }

            if (data.tokensRemaining !== undefined && data.tokensRemaining !== null) {
                setUserTokens(prev => ({
                    ...prev,
                    aiTokens: data.tokensRemaining,
                    aiTokensUsed: (prev.aiTokensUsed || 0) + (data.tokensDeducted || aiNumQuestions)
                }));
            }
            
            setShowAIModal(false);
            setAiTopic('');
        } catch (err) {
            console.error(err);
            setAiError(err.message || 'Something went wrong while generating the quiz.');
        } finally {
            setAiLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now(),
            text: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            timeLimit: timeLimit
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        const updated = [...questions];
        updated[questionIndex].options[optionIndex] = value;
        setQuestions(updated);
    };

    const deleteQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const downloadSampleCSV = () => {
        const csvContent = `Question,Option A,Option B,Option C,Option D,Correct Answer
"What is the capital of France?","London","Berlin","Paris","Madrid","Paris"
"Which planet is known as the Red Planet?","Mars","Venus","Jupiter","Saturn","Mars"
"What is 2 + 2?","3","4","5","22","4"`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz_sample.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n').filter(line => line.trim());

                // Skip header row
                const dataLines = lines.slice(1);

                const parsedQuestions = dataLines.map((line, index) => {
                    // Simple CSV parsing (handles quoted fields)
                    const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
                    const fields = line.split(regex).map(field =>
                        field.trim().replace(/^"|"$/g, '')
                    );

                    if (fields.length < 6) {
                        throw new Error(`Line ${index + 2}: Invalid format`);
                    }

                    return {
                        id: Date.now() + index,
                        text: fields[0],
                        options: [fields[1], fields[2], fields[3], fields[4]],
                        correctAnswer: fields[5],
                        media: null
                    };
                });

                setQuestions([...questions, ...parsedQuestions]);
                setError('');
            } catch (err) {
                setError('Error parsing CSV: ' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    const handleMediaUpload = async (questionIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (10MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds the 5MB upload limit. Please choose a smaller image.');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            setError('Only image and video files are allowed (JPEG, PNG, WEBP, GIF)');
            return;
        }

        // Upload to server instead of storing as base64
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            const updated = [...questions];
            updated[questionIndex].media = {
                type: file.type.startsWith('image/') ? 'image' : 'video',
                data: data.url, // Store the URL instead of base64
                name: file.name
            };
            setQuestions(updated);
            setError('');
        } catch (err) {
            setError(err.message || 'Error uploading file');
        }

        e.target.value = ''; // Reset input
    };

    const removeMedia = (questionIndex) => {
        const updated = [...questions];
        updated[questionIndex].media = null;
        setQuestions(updated);
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds the 5MB upload limit. Please choose a smaller file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            if (type === 'background') {
                setBackgroundImage(data.url);
            } else if (type === 'music') {
                setMusic(data.url);
            }
            setError('');
        } catch (err) {
            setError(err.message || 'Error uploading file');
        }
    };

    const handleSave = async () => {
        setError('');

        // Validation
        if (!quizTitle.trim()) {
            setError('Quiz title is required');
            return;
        }

        if (questions.length === 0) {
            setError('Add at least one question');
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                setError(`Question ${i + 1}: Question text is required`);
                return;
            }

            if (q.options.some(opt => !opt.trim())) {
                setError(`Question ${i + 1}: All options must be filled`);
                return;
            }

            // Only check for correct answer in quiz mode, not poll mode
            if (quizType === 'quiz' && !q.correctAnswer) {
                setError(`Question ${i + 1}: Select a correct answer`);
                return;
            }
        }

        // Get current user info
        const currentUser = localStorage.getItem('current_user');
        if (!currentUser) {
            setError('You must be logged in to save a quiz');
            navigate('/login');
            return;
        }
        const userData = JSON.parse(currentUser);

        // Save quiz to MongoDB
        const quizData = {
            title: quizTitle,
            questions: questions.map(q => ({ ...q, timeLimit })), // Apply global time limit to all questions
            type: quizType,
            backgroundImage,
            music,
            creatorId: userData._id,
            creatorEmail: userData.email,
            creatorName: userData.name
        };

        try {
            let response;
            if (editingQuiz && editingQuiz._id) {
                // Update existing quiz
                response = await fetch(`/api/quizzes/${editingQuiz._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(quizData)
                });
            } else {
                // Create new quiz
                response = await fetch('/api/quizzes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(quizData)
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save quiz');
            }

            navigate('/dashboard');
        } catch (err) {
            setError('Error saving quiz: ' + err.message);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: 'clamp(1rem, 3vw, 2rem)' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <h1 className="title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.25rem' }}>
                                {editingQuiz ? `Edit ${quizType === 'poll' ? 'Poll' : 'Quiz'}` : `Create New ${quizType === 'poll' ? 'Poll' : 'Quiz'}`}
                            </h1>
                            <span style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '1rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                background: quizType === 'poll' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                color: quizType === 'poll' ? '#10b981' : '#8b5cf6',
                                border: `1px solid ${quizType === 'poll' ? '#10b981' : '#8b5cf6'}`
                            }}>
                                {quizType === 'poll' ? 'POLL' : 'QUIZ'}
                            </span>
                        </div>
                        <p className="subtitle" style={{ margin: 0 }}>
                            {quizType === 'poll' ? 'Collect opinions and feedback' : 'Questions with correct answers and scoring'}
                        </p>
                    </div>
                </div>

                {/* Quiz Title */}
                <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>
                        Quiz Title
                    </label>
                    <input
                        className="input"
                        type="text"
                        placeholder="Enter quiz title (e.g., General Knowledge Quiz)"
                        value={quizTitle}
                        onChange={e => setQuizTitle(e.target.value)}
                        style={{ fontSize: '1.125rem', padding: '1rem' }}
                    />
                </div>

                {/* Time Limit */}
                <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                            <Clock size={24} />
                        </div>
                        <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 'bold', margin: 0 }}>Time Limit</h2>
                    </div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>
                        Time per Question (seconds)
                    </label>
                    <input
                        className="input"
                        type="number"
                        min="5"
                        max="300"
                        value={timeLimit}
                        onChange={e => setTimeLimit(parseInt(e.target.value) || 10)}
                        style={{ fontSize: '1.125rem', padding: '1rem', width: '100%' }}
                    />
                </div>

                {/* Customization Section */}
                <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                            <Palette size={24} />
                        </div>
                        <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 'bold', margin: 0 }}>Customize Appearance</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 'clamp(1rem, 3vw, 2rem)' }}>
                        {/* Background Image */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600' }}>
                                Background Image
                            </label>
                            {backgroundImage ? (
                                <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', height: '150px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={backgroundImage} alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        onClick={() => setBackgroundImage('')}
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={16} color="white" />
                                    </button>
                                </div>
                            ) : (
                                <label className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', border: '2px dashed rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                                    <Image size={32} style={{ opacity: 0.5 }} />
                                    <span style={{ fontSize: '0.875rem' }}>Upload Background Image</span>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'background')} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>

                        {/* Background Music */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600' }}>
                                Background Music
                            </label>
                            {music ? (
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <audio controls src={music} style={{ height: '32px', flex: 1 }} />
                                    <button
                                        onClick={() => setMusic('')}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ) : (
                                <label className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', border: '2px dashed rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                                    <Music size={32} style={{ opacity: 0.5 }} />
                                    <span style={{ fontSize: '0.875rem' }}>Upload Lite Music (MP3)</span>
                                    <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'music')} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 'bold' }}>Questions</h2>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAIModal(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.875rem, 2vw, 1rem)', padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem)', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                                <Sparkles size={18} />
                                Generate with AI
                            </button>
                            <button onClick={downloadSampleCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.875rem, 2vw, 1rem)', padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem)' }}>
                                <Download size={18} />
                                <span style={{ display: 'none' }} className="mobile-hide">Sample </span>CSV
                            </button>
                            <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'clamp(0.875rem, 2vw, 1rem)', padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem)' }}>
                                <Upload size={18} />
                                <span style={{ display: 'none' }} className="mobile-hide">Upload </span>CSV
                                <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} />
                            </label>
                            <button onClick={addQuestion} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.875rem, 2vw, 1rem)', padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem)' }}>
                                <Plus size={20} />
                                Add Question
                            </button>
                        </div>
                    </div>

                    {questions.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                            <p className="subtitle">No questions yet. Click "Add Question" to get started!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {questions.map((question, qIndex) => (
                                <div key={question.id} className="card animate-fade-in">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', gap: '1rem' }}>
                                        <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.125rem)', fontWeight: 'bold', color: 'var(--accent)' }}>
                                            Question {qIndex + 1}
                                        </h3>
                                        <button
                                            onClick={() => deleteQuestion(qIndex)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem', color: '#ef4444' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Question Text */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                            Question Text
                                        </label>
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="Enter your question"
                                            value={question.text}
                                            onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                        />
                                    </div>

                                    {/* Media Upload */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                            Media (Optional) - Max 10MB
                                        </label>
                                        {question.media ? (
                                            <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', background: 'var(--bg-secondary)', padding: '1rem' }}>
                                                <button
                                                    onClick={() => removeMedia(qIndex)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '0.5rem',
                                                        right: '0.5rem',
                                                        background: 'rgba(239, 68, 68, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        zIndex: 10
                                                    }}
                                                >
                                                    <X size={18} color="white" />
                                                </button>
                                                {question.media.type === 'image' ? (
                                                    <img src={question.media.data} alt="Question media" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                                                ) : (
                                                    <video src={question.media.data} controls style={{ maxWidth: '100%', maxHeight: '300px' }} />
                                                )}
                                                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{question.media.name}</p>
                                            </div>
                                        ) : (
                                            <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                                                <Image size={18} />
                                                <Video size={18} />
                                                Upload Image/Video
                                                <input type="file" accept="image/*,video/*" onChange={(e) => handleMediaUpload(qIndex, e)} style={{ display: 'none' }} />
                                            </label>
                                        )}
                                    </div>

                                    {/* Options */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                            Answer Options
                                        </label>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {question.options.map((option, oIndex) => (
                                                <div key={oIndex} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                    <span style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        background: 'var(--accent)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {String.fromCharCode(65 + oIndex)}
                                                    </span>
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                        value={option}
                                                        onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                        style={{ flex: 1 }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Correct Answer - Only for Quiz type */}
                                    {quizType === 'quiz' && (
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                                Correct Answer
                                            </label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))', gap: '0.75rem' }}>
                                                {question.options.map((option, oIndex) => (
                                                    <button
                                                        key={oIndex}
                                                        type="button"
                                                        onClick={() => updateQuestion(qIndex, 'correctAnswer', option)}
                                                        className={question.correctAnswer === option ? 'btn btn-primary' : 'btn btn-secondary'}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.75rem',
                                                            background: question.correctAnswer === option ? '#10b981' : 'var(--bg-secondary)',
                                                            border: question.correctAnswer === option ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)'
                                                        }}
                                                    >
                                                        {question.correctAnswer === option && <Check size={16} />}
                                                        {String.fromCharCode(65 + oIndex)}: {option || '(empty)'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="animate-fade-in" style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#ef4444',
                        marginBottom: '1.5rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        padding: '1.25rem',
                        fontSize: '1.125rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <Save size={20} />
                    {editingQuiz ? 'Update Quiz' : 'Save Quiz'}
                </button>

                {/* AI Generator Modal */}
                {showAIModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(10, 14, 26, 0.8)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <div className="card" style={{
                            width: '100%',
                            maxWidth: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            background: 'var(--bg-secondary)',
                            border: '1.5px solid var(--border-color)',
                            padding: '2rem',
                            boxShadow: 'var(--shadow-xl)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                        <Sparkles size={20} color="var(--accent-secondary)" />
                                        Generate Quiz with AI
                                    </h2>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        marginTop: '0.35rem',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: (userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) >= aiNumQuestions ? 'rgba(99, 102, 241, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                        color: (userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) >= aiNumQuestions ? 'var(--accent-primary)' : 'var(--error)',
                                        border: `1px solid ${(userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) >= aiNumQuestions ? 'rgba(99, 102, 241, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                                    }}>
                                        <Zap size={13} fill="currentColor" /> {userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50} AI Tokens Available
                                    </div>
                                </div>
                                <button onClick={() => { if (!aiLoading) setShowAIModal(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    What is this quiz about?
                                </label>
                                <textarea
                                    className="input"
                                    placeholder="e.g. JavaScript Closures, WWII Key Events, French Verbs, etc. Provide context or topic..."
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    disabled={aiLoading}
                                    style={{ minHeight: '100px', resize: 'vertical', fontSize: '0.95rem' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        Questions
                                    </label>
                                    <select
                                        className="input"
                                        value={aiNumQuestions}
                                        onChange={e => setAiNumQuestions(parseInt(e.target.value))}
                                        disabled={aiLoading}
                                        style={{ fontSize: '0.95rem' }}
                                    >
                                        <option value={3}>3 Questions</option>
                                        <option value={5}>5 Questions</option>
                                        <option value={10}>10 Questions</option>
                                        <option value={15}>15 Questions</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        Difficulty
                                    </label>
                                    <select
                                        className="input"
                                        value={aiDifficulty}
                                        onChange={e => setAiDifficulty(e.target.value)}
                                        disabled={aiLoading}
                                        style={{ fontSize: '0.95rem' }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            {/* Token Cost Breakdown */}
                            <div style={{
                                padding: '0.65rem 0.85rem',
                                background: 'var(--bg-primary)',
                                borderRadius: '0.6rem',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.8rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    ⚡ Generation Cost: <strong>{aiNumQuestions} Tokens</strong>
                                </span>
                                <span style={{
                                    fontWeight: 700,
                                    color: (userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) >= aiNumQuestions ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {(userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) >= aiNumQuestions
                                        ? `${(userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) - aiNumQuestions} remaining after`
                                        : `⚠️ Out of tokens (${userTokens.aiTokens || 0} left)`}
                                </span>
                            </div>

                            {(userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) < aiNumQuestions && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '0.6rem',
                                    color: '#ef4444',
                                    fontSize: '0.825rem',
                                    lineHeight: 1.4
                                }}>
                                    <strong>Insufficient AI Tokens!</strong> You need {aiNumQuestions} tokens to generate this quiz, but only have {userTokens.aiTokens || 0} left. Select fewer questions or visit your <a href="/dashboard" style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 700 }}>Dashboard</a> to top up.
                                </div>
                            )}

                            {aiError && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '0.5rem',
                                    color: '#ef4444',
                                    fontSize: '0.875rem'
                                }}>
                                    {aiError}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    onClick={() => setShowAIModal(false)}
                                    disabled={aiLoading}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.95rem', borderRadius: '0.75rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAIGenerate}
                                    disabled={aiLoading || ((userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50) < aiNumQuestions)}
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.95rem', borderRadius: '0.75rem', minWidth: '120px' }}
                                >
                                    {aiLoading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '14px',
                                                height: '14px',
                                                border: '2px solid transparent',
                                                borderTop: '2px solid white',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }}></div>
                                            <span>Creating...</span>
                                        </div>
                                    ) : (
                                        'Generate'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
