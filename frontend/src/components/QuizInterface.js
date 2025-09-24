import React, { useState, useEffect } from 'react';
import { chatService } from '../services/api';

const QuizInterface = ({ document, onBack, onStartOver }) => {
    const [isGenerating, setIsGenerating] = useState(true);
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

    useEffect(() => {
        generateQuiz();
    }, []);

    const generateQuiz = async () => {
        setIsGenerating(true);
        try {
            const response = await chatService.generateQuizRAG('burak', 5, 'medium');

            if (response.error) {
                setQuestions(getDefaultQuestions());
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
            } else {
                setQuestions(getDefaultQuestions());
            }
        } catch (error) {
            console.error('Quiz generation error:', error);
            setQuestions(getDefaultQuestions());
        } finally {
            setIsGenerating(false);
        }
    };

    const getDefaultQuestions = () => [
        {
            question: "There was an issue during document upload. Please try again.",
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
                }
            } else {
                setMistakeAnalysis("Congratulations! You answered all questions correctly. Excellent performance!");
                setWebResources([]);
                setCanSaveReport(true);
                setReportData({
                    username: 'burak',
                    wrongAnswers: [],
                    analysis: "Perfect score achieved!",
                    webResources: [],
                    timestamp: Date.now()
                });
            }

        } catch (error) {
            console.error('Quiz evaluation failed:', error);
            const manualResult = calculateManualResults();
            setQuizResult(manualResult);
            setShowResults(true);
            setMistakeAnalysis("Quiz evaluation completed with basic analysis.");
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
            alert('No report data available to save.');
            return;
        }

        setIsSavingReport(true);
        try {
            const response = await chatService.saveQuizReport({
                username: 'burak',
                reportData: reportData
            });

            if (response.error) {
                alert('Failed to save report: ' + response.error);
            } else {
                alert(`Report saved successfully!\nLocation: ${response.filePath}`);
            }
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to save report. Please try again.');
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
        generateQuiz();
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6">
                        <div className="w-full h-full border-4 border-indigo-300/30 border-t-indigo-400 rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-semibold text-indigo-100 mb-2">
                        Preparing Quiz
                    </h2>
                    <p className="text-indigo-300">
                        Generating questions from your document<span className="loading-dots"></span>
                    </p>
                </div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="min-h-screen p-6">
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
                            <button onClick={restartQuiz} className="btn-primary">
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
                        <div className="card p-6 mb-8 text-center">
                            <h3 className="text-xl font-semibold text-indigo-100 mb-4 flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Save Analysis Report
                            </h3>
                            <p className="text-indigo-300 mb-4">
                                Save your complete quiz analysis, including incorrect answers, AI feedback, and web resources to your computer for future reference.
                            </p>
                            <button
                                onClick={handleSaveReport}
                                disabled={isSavingReport}
                                className={`btn-primary ${isSavingReport ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                            >
                                {isSavingReport ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving Report...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                        </svg>
                                        Save My Wrong Answers Report
                                    </>
                                )}
                            </button>
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
            {/* Header */}
            <div className="glass-effect border-b border-indigo-400/30 p-4 backdrop-blur-xl">
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
                        <div>
                            <h1 className="text-xl font-bold text-indigo-100 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Enhanced Quiz
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