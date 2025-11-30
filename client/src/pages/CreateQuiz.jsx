import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Check, Upload, Download, Image, Video, X, Music, Palette, Clock } from 'lucide-react';

export default function CreateQuiz() {
    const navigate = useNavigate();
    const location = useLocation();
    const editingQuiz = location.state?.quiz;
    const quizType = location.state?.type || editingQuiz?.type || 'quiz';

    const [quizTitle, setQuizTitle] = useState(editingQuiz?.title || '');
    const [questions, setQuestions] = useState(editingQuiz?.questions || []);
    const [backgroundImage, setBackgroundImage] = useState(editingQuiz?.backgroundImage || '');
    const [music, setMusic] = useState(editingQuiz?.music || '');
    const [timeLimit, setTimeLimit] = useState(editingQuiz?.questions?.[0]?.timeLimit || 10);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is logged in
        const currentUser = localStorage.getItem('current_user');
        if (!currentUser) {
            navigate('/login');
        }
    }, [navigate]);

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now(),
            text: '',
            options: ['', '', '', ''],
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

    const handleMediaUpload = (questionIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            setError('Only image and video files are allowed');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const updated = [...questions];
            updated[questionIndex].media = {
                type: file.type.startsWith('image/') ? 'image' : 'video',
                data: event.target.result,
                name: file.name
            };
            setQuestions(updated);
            setError('');
        };
        reader.readAsDataURL(file);
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

        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            if (type === 'background') {
                setBackgroundImage(data.url);
            } else if (type === 'music') {
                setMusic(data.url);
            }
            setError('');
        } catch (err) {
            setError('Error uploading file: ' + err.message);
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

        // Save quiz to MongoDB
        const quizData = {
            title: quizTitle,
            questions: questions,
            type: quizType,
            backgroundImage,
            music,
            questions: questions.map(q => ({ ...q, timeLimit })) // Apply global time limit to all questions
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                            <Clock size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Time Limit</h2>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                            <Palette size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Customize Appearance</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Questions</h2>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button onClick={downloadSampleCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={18} />
                                Sample CSV
                            </button>
                            <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <Upload size={18} />
                                Upload CSV
                                <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} />
                            </label>
                            <button onClick={addQuestion} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--accent)' }}>
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
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
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
                        gap: '0.75rem'
                    }}
                >
                    <Save size={20} />
                    {editingQuiz ? 'Update Quiz' : 'Save Quiz'}
                </button>
            </div>
        </div>
    );
}
