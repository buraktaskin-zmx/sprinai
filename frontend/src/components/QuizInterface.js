import React, { useState, useEffect } from 'react';
import { chatService } from '../services/api';

// Modern Notification Toast Component
const NotificationToast = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const getNotificationStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-500/90 border-green-400/50 text-green-50';
            case 'error':
                return 'bg-red-500/90 border-red-400/50 text-red-50';
            case 'info':
                return 'bg-blue-500/90 border-blue-400/50 text-blue-50';
            default:
                return 'bg-indigo-500/90 border-indigo-400/50 text-indigo-50';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div
            className={`
        transform transition-all duration-300 ease-out backdrop-blur-sm
        ${isVisible
                ? 'translate-x-0 opacity-100 scale-100'
                : 'translate-x-full opacity-0 scale-95'
            }
        ${getNotificationStyles(notification.type)}
        glass-effect border rounded-xl shadow-xl p-4 min-w-[360px] max-w-[400px]
      `}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed break-words">
                        {notification.message}
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="mt-3 w-full bg-white/20 rounded-full h-1 overflow-hidden">
                <div
                    className="h-full bg-white/60 rounded-full"
                    style={{
                        animation: `progressBar ${notification.duration}ms linear forwards`
                    }}
                />
            </div>

            <style jsx>{`
                @keyframes progressBar {
                    0% { width: 100%; }
                    100% { width: 0%; }
                }
            `}</style>
        </div>
    );
};

// Notification System Component
const NotificationSystem = ({ notifications, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {notifications.map(notification => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onClose={() => onRemove(notification.id)}
                />
            ))}
        </div>
    );
};

const QuizInterface = ({ document, onBack, onStartOver }) => {
    const [currentView, setCurrentView] = useState('settings'); // Start with settings
    const [isGenerating, setIsGenerating] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [mistakeAnalysis, setMistakeAnalysis] = useState(null);
    const [webResources, setWebResources] = useState([]);
    const [canSaveReport, setCanSaveReport] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [isSavingReport, setIsSavingReport] = useState(false);

    // Quiz Settings
    const [quizSettings, setQuizSettings] = useState({
        questionCount: 5,
        difficulty: 'medium'
    });

    // Notification system state
    const [notifications, setNotifications] = useState([]);

    // Notification helper functions
    const addNotification = (message, type = 'success', duration = 6000) => {
        const id = Date.now() + Math.random();
        const notification = { id, message, type, duration };

        setNotifications(prev => [...prev, notification]);

        setTimeout(() => {
            removeNotification(id);
        }, duration);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const generateQuiz = async () => {
        setIsGenerating(true);
        setCurrentView('generating');

        try {
            const response = await chatService.generateQuizRAG('burak', quizSettings.questionCount, quizSettings.difficulty);

            if (response.error) {
                setQuestions(getDefaultQuestions());
                addNotification('❌ An error occurred while generating quiz. Default questions loaded.', 'error');
                setCurrentView('quiz');
                return;
            }

            if (response.questions && Array.isArray(response.questions)) {
                const convertedQuestions = response.questions.map((q, index) => {
                    const answerLetter = q.answer;
                    const correctAnswerIndex = answerLetter === 'A' ? 0 :
                        answerLetter === 'B' ? 1 :
                            answerLetter === 'C' ? 2 : 3;

                    return {
                        question: q.question,
                        options: [
                            `A) ${q.options.A}`,
                            `B) ${q.options.B}`,
                            `C) ${q.options.C}`,
                            `D) ${q.options.D}`
                        ],
                        correctAnswer: correctAnswerIndex,
                        explanation: `Correct answer: ${answerLetter}) ${q.options[answerLetter]}`,
                        originalOptions: q.options
                    };
                });

                setQuestions(convertedQuestions);
                addNotification(`✅ Quiz with ${convertedQuestions.length} questions is ready!`, 'success');
                setCurrentView('quiz');
            } else {
                setQuestions(getDefaultQuestions());
                addNotification('⚠️ Quiz could not be generated. Please try again.', 'error');
                setCurrentView('quiz');
            }
        } catch (error) {
            console.error('Quiz generation error:', error);
            setQuestions(getDefaultQuestions());
            addNotification('❌ An error occurred while generating quiz. Default questions loaded.', 'error');
            setCurrentView('quiz');
        } finally {
            setIsGenerating(false);
        }
    };

    const getDefaultQuestions = () => [
        {
            question: "A problem occurred during document upload. Please try again.",
            options: [
                "A) Re-upload the document",
                "B) Refresh the page",
                "C) Try a different document",
                "D) Get support"
            ],
            correctAnswer: 0,
            explanation: "Please re-upload your document and try again.",
            originalOptions: { A: "Re-upload the document", B: "Refresh the page", C: "Try a different document", D: "Get support" }
        }
    ];

    const handleAnswerSelect = (optionIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: optionIndex
        });
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const finishQuiz = async () => {
        setIsAnalyzing(true);

        try {
            const result = await chatService.evaluateQuiz(questions, selectedAnswers, 'burak');

            const formattedResult = {
                score: result.correctAnswers || 0,
                totalQuestions: result.totalQuestions || questions.length,
                percentage: result.totalQuestions ? Math.round((result.correctAnswers / result.totalQuestions) * 100) : 0,
                wrongAnswers: result.wrongAnswersList || []
            };

            setQuizResult(formattedResult);
            setShowResults(true);
            setCurrentView('results');

            // Enhanced mistake analysis with web resources
            if (formattedResult.wrongAnswers && formattedResult.wrongAnswers.length > 0) {
                try {
                    const analysisResponse = await chatService.analyzeMistakesWithWebResources(formattedResult.wrongAnswers, 'burak');

                    setMistakeAnalysis(analysisResponse.analysis || "Analysis completed.");
                    setWebResources(analysisResponse.webResources || []);
                    setCanSaveReport(analysisResponse.canSaveReport || false);
                    setReportData(analysisResponse.reportData || null);
                } catch (analysisError) {
                    console.error('Enhanced analysis failed:', analysisError);
                    setMistakeAnalysis("Analysis completed, but additional resources could not be loaded.");
                    setWebResources([]);
                    setCanSaveReport(false);
                    addNotification('⚠️ Advanced analysis could not be completed, showing basic analysis.', 'warning');
                }
            } else {
                setMistakeAnalysis("Congratulations! You answered all questions correctly. Perfect performance!");
                setWebResources([]);
                setCanSaveReport(true);
                setReportData({
                    username: 'burak',
                    wrongAnswers: [],
                    analysis: "Perfect score achieved! 🌟",
                    webResources: [],
                    timestamp: Date.now()
                });
            }

        } catch (error) {
            console.error('Quiz evaluation failed:', error);
            const manualResult = calculateManualResults();
            setQuizResult(manualResult);
            setShowResults(true);
            setCurrentView('results');
            setMistakeAnalysis("Quiz evaluation completed with basic analysis.");
            addNotification('⚠️ Problem occurred during quiz evaluation, showing basic analysis.', 'warning');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const calculateManualResults = () => {
        let correct = 0;
        const wrongAnswers = [];

        questions.forEach((question, index) => {
            const userAnswer = selectedAnswers[index];
            if (userAnswer === question.correctAnswer) {
                correct++;
            } else {
                wrongAnswers.push({
                    questionNumber: index + 1,
                    questionText: question.question,
                    userAnswer: userAnswer !== undefined ? question.options[userAnswer] || 'Not answered' : 'Not answered',
                    correctAnswer: question.options[question.correctAnswer],
                    explanation: question.explanation || 'No explanation available'
                });
            }
        });

        return {
            score: correct,
            totalQuestions: questions.length,
            percentage: Math.round((correct / questions.length) * 100),
            wrongAnswers: wrongAnswers
        };
    };

    const handleSaveReport = async () => {
        if (!canSaveReport || !reportData) {
            addNotification('❌ No report data found to save.', 'error');
            return;
        }

        setIsSavingReport(true);
        try {
            const response = await chatService.saveQuizReport({
                username: 'burak',
                reportData: reportData
            });

            if (response.error) {
                addNotification(`❌ Report could not be saved: ${response.error}`, 'error', 7000);
            } else {
                const fileName = response.filePath ? response.filePath.split('\\').pop() || response.filePath.split('/').pop() : 'quiz_report.txt';
                addNotification(
                    `📊 Quiz analysis report saved successfully! 
          📁 File: ${fileName}
          📂 Location: ${response.filePath}`,
                    'success',
                    8000
                );
            }
        } catch (error) {
            console.error('Error saving report:', error);
            addNotification('❌ Network error occurred. Please try again.', 'error', 6000);
        } finally {
            setIsSavingReport(false);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setQuizResult(null);
        setMistakeAnalysis(null);
        setWebResources([]);
        setCanSaveReport(false);
        setReportData(null);
        setCurrentView('settings'); // Go back to settings
    };

    const startNewQuiz = () => {
        setCurrentView('settings');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setQuizResult(null);
        setMistakeAnalysis(null);
        setWebResources([]);
        setCanSaveReport(false);
        setReportData(null);
    };

    // Quiz Settings View
    if (currentView === 'settings') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                {/* Notification System */}
                <NotificationSystem
                    notifications={notifications}
                    onRemove={removeNotification}
                />

                <div className="max-w-2xl w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-400/30 mb-6 neon-glow">
                            <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-indigo-100 mb-4">
                            🎯 Test Yourself!
                        </h1>

                        <div className="card max-w-md mx-auto p-4">
                            <div className="flex items-center justify-center mb-3">
                                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-indigo-100">{document.name}</p>
                                    <p className="text-sm text-indigo-300">Preparing quiz...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Settings */}
                    <div className="card p-8 mb-8">
                        <h2 className="text-xl font-bold text-indigo-100 mb-6 text-center">Quiz Settings</h2>

                        {/* Question Count */}
                        <div className="mb-6">
                            <label className="block text-indigo-200 text-sm font-medium mb-4">
                                📊 Number of Questions
                            </label>
                            <div className="flex justify-center space-x-4">
                                {[3, 5, 7].map(count => (
                                    <button
                                        key={count}
                                        onClick={() => setQuizSettings(prev => ({ ...prev, questionCount: count }))}
                                        className={`
                                            px-6 py-3 rounded-xl font-semibold transition-all duration-300 min-w-[80px]
                                            ${quizSettings.questionCount === count
                                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg neon-glow scale-105'
                                            : 'bg-white/10 border border-indigo-400/30 text-indigo-200 hover:bg-indigo-600/20'
                                        }
                                        `}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty Level */}
                        <div className="mb-8">
                            <label className="block text-indigo-200 text-sm font-medium mb-4">
                                ⚡ Difficulty Level
                            </label>
                            <div className="flex justify-center space-x-4">
                                {[
                                    { key: 'easy', label: '😊 Easy', color: 'from-green-600 to-emerald-600' },
                                    { key: 'medium', label: '🎯 Medium', color: 'from-yellow-600 to-orange-600' },
                                    { key: 'hard', label: '🔥 Hard', color: 'from-red-600 to-pink-600' }
                                ].map(diff => (
                                    <button
                                        key={diff.key}
                                        onClick={() => setQuizSettings(prev => ({ ...prev, difficulty: diff.key }))}
                                        className={`
                                            px-6 py-3 rounded-xl font-semibold transition-all duration-300 min-w-[100px]
                                            ${quizSettings.difficulty === diff.key
                                            ? `bg-gradient-to-r ${diff.color} text-white shadow-lg neon-glow scale-105`
                                            : 'bg-white/10 border border-indigo-400/30 text-indigo-200 hover:bg-indigo-600/20'
                                        }
                                        `}
                                    >
                                        {diff.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Quiz Button */}
                        <div className="text-center">
                            <button
                                onClick={generateQuiz}
                                className="btn-primary px-8 py-4 text-lg font-bold hover:scale-105"
                            >
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                🚀 Start Quiz!
                            </button>
                            <p className="text-indigo-300 text-sm mt-3">
                                {quizSettings.questionCount} questions • {quizSettings.difficulty === 'easy' ? 'Easy' : quizSettings.difficulty === 'medium' ? 'Medium' : 'Hard'} level
                            </p>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="text-center">
                        <button
                            onClick={onBack}
                            className="btn-secondary"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Generating View
    if (currentView === 'generating' || isGenerating) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6">
                        <div className="w-full h-full border-4 border-indigo-300/30 border-t-indigo-400 rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-semibold text-indigo-100 mb-2">
                        Preparing Quiz...
                    </h2>
                    <p className="text-indigo-300">
                        Creating {quizSettings.questionCount} {quizSettings.difficulty} level questions
                        <span className="loading-dots"></span>
                    </p>
                </div>
            </div>
        );
    }

    if (showResults || currentView === 'results') {
        return (
            <div className="min-h-screen p-6">
                {/* Notification System */}
                <NotificationSystem
                    notifications={notifications}
                    onRemove={removeNotification}
                />

                {/* Header */}
                <div className="glass-effect border-b border-indigo-400/30 p-4 backdrop-blur-xl mb-8">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={onBack}
                                className="mr-4 p-2 hover:bg-indigo-500/20 rounded-full transition-all duration-300 text-indigo-200 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-bold text-indigo-100">Quiz Results</h1>
                        </div>
                        <button onClick={onStartOver} className="btn-secondary text-sm">
                            New Document
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Score Card */}
                    <div className="card p-8 mb-8 text-center neon-glow">
                        <div className="mb-6">
                            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4 ${
                                quizResult.percentage >= 80 ? 'bg-green-500/20 text-green-400 border border-green-400/30' :
                                    quizResult.percentage >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' :
                                        'bg-red-500/20 text-red-400 border border-red-400/30'
                            }`}>
                                {quizResult.percentage}%
                            </div>
                            <h2 className="text-2xl font-bold text-indigo-100 mb-2">
                                Quiz Completed!
                            </h2>
                            <p className="text-lg text-indigo-300">
                                {quizResult.score} / {quizResult.totalQuestions} correct answers
                            </p>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button onClick={startNewQuiz} className="btn-primary">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                New Quiz
                            </button>
                            <button onClick={onBack} className="btn-secondary">
                                Go Back
                            </button>
                        </div>
                    </div>

                    {/* Loading state for analysis */}
                    {isAnalyzing && (
                        <div className="card p-6 mb-8 text-center">
                            <div className="flex items-center justify-center space-x-3">
                                <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                                <span className="text-indigo-200">AI is analyzing your performance and finding web resources...</span>
                            </div>
                        </div>
                    )}

                    {/* Wrong Answers */}
                    {quizResult.wrongAnswers && quizResult.wrongAnswers.length > 0 && (
                        <div className="card p-6 mb-8">
                            <h3 className="text-xl font-semibold text-indigo-100 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Incorrect Answers
                            </h3>
                            <div className="space-y-4">
                                {quizResult.wrongAnswers.map((mistake, index) => (
                                    <div key={index} className="glass-effect p-4 rounded-xl border border-red-400/30">
                                        <div className="mb-2">
                      <span className="text-sm text-red-300 font-medium">
                        Question {mistake.questionNumber}:
                      </span>
                                            <p className="font-medium text-indigo-100 mt-1">
                                                {mistake.questionText}
                                            </p>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <p className="text-red-300">
                                                <span className="font-medium">Your Answer:</span> {mistake.userAnswer || mistake.studentAnswer}
                                            </p>
                                            <p className="text-green-300">
                                                <span className="font-medium">Correct Answer:</span> {mistake.correctAnswer}
                                            </p>
                                            {mistake.explanation && (
                                                <p className="text-indigo-300 mt-2 italic">
                                                    <span className="font-medium">Explanation:</span> {mistake.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Analysis */}
                    {mistakeAnalysis && (
                        <div className="card p-6 mb-8">
                            <h3 className="text-xl font-semibold text-indigo-100 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI Performance Analysis
                            </h3>
                            <div className="glass-effect p-6 rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-indigo-200 leading-relaxed whitespace-pre-line">
                                        {mistakeAnalysis}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Web Resources Section */}
                    {webResources && webResources.length > 0 && (
                        <div className="card p-6 mb-8">
                            <h3 className="text-xl font-semibold text-indigo-100 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                </svg>
                                Additional Study Resources
                            </h3>
                            <div className="space-y-4">
                                {webResources.map((resource, index) => (
                                    <div key={index} className="glass-effect p-4 rounded-xl border border-green-400/30 bg-gradient-to-r from-green-900/10 to-blue-900/10">
                                        <h4 className="font-semibold text-green-300 mb-2">
                                            {resource.topic}
                                        </h4>
                                        <div className="text-sm text-indigo-200 whitespace-pre-line mb-3">
                                            {resource.content}
                                        </div>
                                        {resource.urls && resource.urls.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs text-green-400 mb-2">Related Links:</p>
                                                <div className="space-y-1">
                                                    {resource.urls.map((url, urlIndex) => (
                                                        <a
                                                            key={urlIndex}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-300 hover:text-blue-200 underline block"
                                                        >
                                                            {url}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save Report Section */}
                    {canSaveReport && reportData && (
                        <div className="card p-6 mb-8 text-center border border-purple-400/30 bg-gradient-to-r from-purple-900/10 to-indigo-900/10">
                            <h3 className="text-xl font-semibold text-indigo-100 mb-4 flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Save Analysis Report
                            </h3>
                            <p className="text-indigo-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                                Save a comprehensive report containing your quiz analysis, incorrect answers, AI feedback, and web resources
                                to your computer. Perfect for future review.
                            </p>
                            <button
                                onClick={handleSaveReport}
                                disabled={isSavingReport}
                                className={`
                  px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center mx-auto
                  ${isSavingReport
                                    ? 'bg-gray-600/30 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                }
                `}
                            >
                                {isSavingReport ? (
                                    <>
                                        <div className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving Report...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                        </svg>
                                        📊 Save My Performance Report
                                    </>
                                )}
                            </button>

                            <div className="mt-4 text-xs text-indigo-400/70">
                                <p>💾 Report will be saved in .txt format</p>
                                <p>📁 Default location: Desktop/Test folder</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Quiz Taking View
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const allQuestionsAnswered = answeredQuestions === questions.length;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Notification System */}
            <NotificationSystem
                notifications={notifications}
                onRemove={removeNotification}
            />

            {/* Header */}
            <div className="glass-effect border-b border-indigo-400/30 p-4 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={startNewQuiz}
                            className="mr-4 p-2 hover:bg-indigo-500/20 rounded-full transition-all duration-300 text-indigo-200 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-indigo-100 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Advanced Quiz
                            </h1>
                            <p className="text-sm text-indigo-300">{document.name}</p>
                        </div>
                    </div>
                    <button onClick={onStartOver} className="btn-secondary text-sm">
                        New Document
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="glass-effect border-b border-indigo-400/30 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-indigo-300">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
                        <span className="text-sm text-indigo-300">
              {answeredQuestions} answered
            </span>
                    </div>
                    <div className="w-full bg-indigo-900/30 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="card p-8 mb-8">
                        <h2 className="text-xl md:text-2xl font-semibold text-indigo-100 mb-6 leading-relaxed">
                            {currentQuestion.question}
                        </h2>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    className={`
                    w-full p-4 text-left rounded-xl border-2 transition-all duration-300
                    ${selectedAnswers[currentQuestionIndex] === index
                                        ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-lg neon-glow'
                                        : 'border-indigo-400/30 bg-white/5 text-indigo-200 hover:border-indigo-400/50 hover:bg-indigo-500/10'
                                    }
                  `}
                                >
                                    <span className="block text-sm md:text-base">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={prevQuestion}
                            disabled={currentQuestionIndex === 0}
                            className={`
                btn-secondary ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        <div className="flex space-x-2">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`
                    w-8 h-8 rounded-full text-sm font-medium transition-all duration-300
                    ${index === currentQuestionIndex
                                        ? 'bg-indigo-500 text-white shadow-lg'
                                        : selectedAnswers[index] !== undefined
                                            ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                                            : 'bg-white/10 text-indigo-300 border border-indigo-400/30'
                                    }
                  `}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        {isLastQuestion ? (
                            <button
                                onClick={finishQuiz}
                                disabled={!allQuestionsAnswered || isAnalyzing}
                                className={`
                  btn-primary ${!allQuestionsAnswered || isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Finish & Get Analysis
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className="btn-secondary"
                            >
                                Next
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizInterface;
