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

    useEffect(() => {
        generateQuiz();
    }, []);

    const generateQuiz = async () => {
        setIsGenerating(true);
        try {
            console.log('Starting quiz generation...');

            const response = await chatService.generateQuizRAG('burak', 5, 'orta');
            console.log('Raw API response:', response);

            try {
                const quizData = typeof response === 'string' ? JSON.parse(response) : response;
                console.log('Parsed quiz data:', quizData);

                if (quizData.error) {
                    console.error('Quiz error:', quizData.error);
                    setQuestions(getDefaultQuestions());
                    return;
                }

                if (quizData.questions && Array.isArray(quizData.questions)) {
                    const convertedQuestions = quizData.questions.map((q, index) => {
                        console.log(`Converting question ${index + 1}:`, q);

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
                            explanation: `Doğru cevap: ${answerLetter}) ${q.options[answerLetter]}`,
                            // Backend için gerekli format
                            originalOptions: q.options
                        };
                    });

                    console.log('Converted questions:', convertedQuestions);
                    setQuestions(convertedQuestions);
                    console.log('Quiz loaded successfully with', convertedQuestions.length, 'questions');
                } else {
                    console.error('Invalid quiz format - no questions array:', quizData);
                    setQuestions(getDefaultQuestions());
                }
            } catch (parseError) {
                console.error('Quiz parse error:', parseError);
                console.log('Failed to parse response:', response);
                setQuestions(getDefaultQuestions());
            }
        } catch (error) {
            console.error('Quiz generation network error:', error);
            setQuestions(getDefaultQuestions());
        } finally {
            setIsGenerating(false);
        }
    };

    const getDefaultQuestions = () => [
        {
            question: "Doküman yükleme sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
            options: [
                "A) Dokümanı yeniden yükle",
                "B) Sayfayı yenile",
                "C) Farklı doküman dene",
                "D) Destek al"
            ],
            correctAnswer: 0,
            explanation: "Lütfen dokümanınızı yeniden yükleyip tekrar deneyin.",
            originalOptions: {
                A: "Dokümanı yeniden yükle",
                B: "Sayfayı yenile",
                C: "Farklı doküman dene",
                D: "Destek al"
            }
        }
    ];

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
            evaluateQuiz();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const evaluateQuiz = async () => {
        try {
            console.log('Evaluating quiz...');

            // Backend için format hazırla
            const questionsForBackend = questions.map(q => ({
                question: q.question,
                options: q.originalOptions,
                correctAnswer: q.correctAnswer
            }));

            const result = await chatService.evaluateQuiz(questionsForBackend, selectedAnswers);
            console.log('Quiz evaluation result:', result);

            setQuizResult(result);
            setShowResults(true);
        } catch (error) {
            console.error('Quiz evaluation failed:', error);
            // Fallback: local calculation
            let correctCount = 0;
            questions.forEach((question, index) => {
                if (selectedAnswers[index] === question.correctAnswer) {
                    correctCount++;
                }
            });

            setQuizResult({
                totalQuestions: questions.length,
                correctAnswers: correctCount,
                wrongAnswers: questions.length - correctCount,
                wrongAnswersList: []
            });
            setShowResults(true);
        }
    };

    const analyzeMistakes = async () => {
        if (!quizResult || !quizResult.wrongAnswersList.length) {
            return;
        }

        setIsAnalyzing(true);
        try {
            console.log('Analyzing mistakes...');
            const analysis = await chatService.analyzeMistakes(quizResult.wrongAnswersList);
            setMistakeAnalysis(analysis.analysis);
        } catch (error) {
            console.error('Mistake analysis failed:', error);
            setMistakeAnalysis('Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setQuizResult(null);
        setMistakeAnalysis(null);
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
                <div className="max-w-6xl w-full text-center animate-fade-in">
                    {/* Test Sonuçları Header */}
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6
            ${quizResult.correctAnswers >= quizResult.totalQuestions * 0.7 ? 'bg-green-100' :
                        quizResult.correctAnswers >= quizResult.totalQuestions * 0.5 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                        <span className={`text-3xl font-bold
              ${quizResult.correctAnswers >= quizResult.totalQuestions * 0.7 ? 'text-green-600' :
                            quizResult.correctAnswers >= quizResult.totalQuestions * 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Math.round((quizResult.correctAnswers / quizResult.totalQuestions) * 100)}%
                        </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Test Tamamlandı!</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        {quizResult.totalQuestions} sorudan {quizResult.correctAnswers} tanesini doğru yanıtladınız
                    </p>

                    {/* Yanlış Sorular Tablosu */}
                    {quizResult.wrongAnswersList && quizResult.wrongAnswersList.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Yanlış Yanıtlanan Sorular</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border px-4 py-3 text-left font-semibold">Soru No</th>
                                        <th className="border px-4 py-3 text-left font-semibold">Soru</th>
                                        <th className="border px-4 py-3 text-left font-semibold">Doğru Cevap</th>
                                        <th className="border px-4 py-3 text-left font-semibold">Verdiğiniz Cevap</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {quizResult.wrongAnswersList.map((wrongAnswer, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border px-4 py-3 font-medium text-center">
                                                {wrongAnswer.questionNumber}
                                            </td>
                                            <td className="border px-4 py-3">
                                                <div className="max-w-md">
                                                    {wrongAnswer.questionText}
                                                </div>
                                            </td>
                                            <td className="border px-4 py-3">
                                                    <span className="text-green-700 font-medium">
                                                        {wrongAnswer.correctAnswer}
                                                    </span>
                                            </td>
                                            <td className="border px-4 py-3">
                                                    <span className="text-red-700 font-medium">
                                                        {wrongAnswer.studentAnswer}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Yapay Zeka Analizi Butonu */}
                            <div className="mt-6">
                                <button
                                    onClick={analyzeMistakes}
                                    disabled={isAnalyzing}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Analiz ediliyor...
                                        </>
                                    ) : (
                                        <>
                                            🤖 Yanlışlarını Yapay Zeka ile Analiz Et
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Analiz Sonucu */}
                            {mistakeAnalysis && (
                                <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
                                    <h4 className="text-xl font-bold text-purple-800 mb-3">🧠 Yapay Zeka Analizi</h4>
                                    <div className="text-left text-gray-800 whitespace-pre-line">
                                        {mistakeAnalysis}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tebrik Mesajı - Hiç Yanlış Yoksa */}
                    {quizResult.wrongAnswersList && quizResult.wrongAnswersList.length === 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                            <h3 className="text-2xl font-bold text-green-800 mb-2">🎉 Mükemmel Performans!</h3>
                            <p className="text-green-700">
                                Tüm soruları doğru yanıtladınız! Dokümanı çok iyi öğrenmişsiniz.
                            </p>
                        </div>
                    )}

                    {/* Aksiyon Butonları */}
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