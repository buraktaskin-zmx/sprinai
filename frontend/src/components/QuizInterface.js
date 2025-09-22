import React, { useState, useEffect } from 'react';
import { chatService } from '../services/api';

const QuizInterface = ({ document, onBack, onStartOver }) => {
    const [isGenerating, setIsGenerating] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        generateQuiz();
    }, []);

    const generateQuiz = async () => {
        setIsGenerating(true);
        try {
            // Alternatif RAG-based approach'u test et
            const response = await chatService.generateQuizRAG('burak', 5, 'orta');

            try {
                const quizData = JSON.parse(response);
                if (quizData.questions && Array.isArray(quizData.questions)) {
                    setQuestions(quizData.questions);
                } else {
                    throw new Error('Invalid quiz format');
                }
            } catch (parseError) {
                console.error('Quiz parse error:', parseError);
                const sampleQuestions = [
                    {
                        question: "Bu doküman hangi ana konu hakkındadır?",
                        options: ["A) Teknoloji", "B) Tarih", "C) Bilim", "D) Sanat"],
                        correctAnswer: 0,
                        explanation: "Dokümanın içeriğine göre ana konu teknoloji."
                    },
                    {
                        question: "Dokümanda bahsedilen temel kavram nedir?",
                        options: ["A) Kavram 1", "B) Kavram 2", "C) Kavram 3", "D) Kavram 4"],
                        correctAnswer: 1,
                        explanation: "Doküman boyunca bu kavram üzerinde durulmuştur."
                    }
                ];
                setQuestions(sampleQuestions);
            }
        } catch (error) {
            console.error('Quiz generation error:', error);
            const sampleQuestions = [
                {
                    question: "Bu doküman hangi konu hakkındadır?",
                    options: ["A) Teknoloji", "B) Tarih", "C) Bilim", "D) Sanat"],
                    correctAnswer: 0,
                    explanation: "Örnek açıklama."
                }
            ];
            setQuestions(sampleQuestions);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: answerIndex
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            calculateScore();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const calculateScore = () => {
        let correctCount = 0;
        questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setShowResults(true);
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sorular Oluşturuluyor...</h2>
                    <p className="text-gray-600">Dokümanınızdan test soruları hazırlanıyor</p>
                    <div className="mt-6">
                        <div className="loading-dots flex justify-center space-x-1">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-2xl w-full text-center animate-fade-in">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6
            ${score >= questions.length * 0.7 ? 'bg-green-100' : score >= questions.length * 0.5 ? 'bg-yellow-100' : 'bg-red-100'}`}>
            <span className={`text-3xl font-bold
              ${score >= questions.length * 0.7 ? 'text-green-600' : score >= questions.length * 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
              {Math.round((score / questions.length) * 100)}%
            </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Test Tamamlandı!</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        {questions.length} sorudan {score} tanesini doğru yanıtladınız
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={restartQuiz}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Testi Tekrarla
                        </button>
                        <button
                            onClick={onBack}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Geri Dön
                        </button>
                        <button
                            onClick={onStartOver}
                            className="text-gray-500 hover:text-gray-700 underline"
                        >
                            Yeni doküman
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-lg p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={onBack}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Çoktan Seçmeli Test</h1>
                            <p className="text-sm text-gray-600">{document.name}</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        {currentQuestionIndex + 1} / {questions.length}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-200 h-2">
                <div
                    className="bg-green-600 h-2 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>

            {/* Question */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-3xl w-full animate-slide-up">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">
                            {currentQuestion?.question}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion?.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                    ${selectedAnswer === index
                                        ? 'border-green-500 bg-green-50 text-green-800'
                                        : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                                    }
                  `}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                ← Önceki
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={selectedAnswer === undefined}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {currentQuestionIndex === questions.length - 1 ? 'Bitir' : 'Sonraki →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizInterface;