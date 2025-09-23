import React, { useState } from 'react';
import { chatService } from '../services/api';

const FlashCardInterface = ({ document, onBack, onStartOver }) => {
    const [currentView, setCurrentView] = useState('chat');
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [flashcards, setFlashcards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    // Welcome message
    React.useEffect(() => {
        const welcomeMessage = {
            id: Date.now(),
            text: `Hello! ${document.name} is ready. Specify which topics you'd like to create flashcards from. For example: "Create flashcards from main topics" or "Make cards from key definitions"`,
            sender: 'bot',
            timestamp: new Date()
        };
        setChatHistory([welcomeMessage]);
    }, [document.name]);

    const handleGenerateFlashCards = async (e) => {
        e.preventDefault();
        if (!message.trim() || isGenerating) return;

        const userMessage = {
            id: Date.now(),
            text: message,
            sender: 'user',
            timestamp: new Date()
        };
        setChatHistory(prev => [...prev, userMessage]);

        setIsGenerating(true);

        try {
            const response = await chatService.generateFlashCards(message, 'burak', 10);

            if (response.error) {
                const errorMessage = {
                    id: Date.now() + 1,
                    text: response.error,
                    sender: 'bot',
                    timestamp: new Date()
                };
                setChatHistory(prev => [...prev, errorMessage]);
                return;
            }

            if (response.flashcards && response.flashcards.length > 0) {
                setFlashcards(response.flashcards);
                setCurrentView('cards');
                setCurrentCardIndex(0);
                setIsFlipped(false);
            } else {
                const errorMessage = {
                    id: Date.now() + 1,
                    text: 'FlashCards could not be created. Please provide more detailed instructions.',
                    sender: 'bot',
                    timestamp: new Date()
                };
                setChatHistory(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: 'An error occurred while creating flashcards. Please try again.',
                sender: 'bot',
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
            setMessage('');
        }
    };

    const nextCard = () => {
        setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
        setIsFlipped(false);
    };

    const prevCard = () => {
        setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        setIsFlipped(false);
    };

    const flipCard = () => {
        setIsFlipped(!isFlipped);
    };

    const backToChat = () => {
        setCurrentView('chat');
        setFlashcards([]);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (currentView === 'chat') {
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    FlashCard Creator
                                </h1>
                                <p className="text-sm text-indigo-300">{document.name}</p>
                            </div>
                        </div>
                        <button onClick={onStartOver} className="btn-secondary text-sm">
                            New Document
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                                    max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm
                                    ${msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                                    : 'bg-white/10 border border-indigo-400/30 text-indigo-100'
                                }
                                `}>
                                    <div className="text-sm md:text-base leading-relaxed">
                                        {msg.text}
                                    </div>
                                    <div className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-indigo-400'}`}>
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {isGenerating && (
                            <div className="flex justify-start">
                                <div className="px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm bg-white/10 border border-indigo-400/30">
                                    <div className="flex items-center space-x-2 text-indigo-300">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                        <span className="text-sm">Creating flashcards...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="glass-effect border-t border-indigo-400/30 p-4 backdrop-blur-xl">
                    <form onSubmit={handleGenerateFlashCards} className="max-w-4xl mx-auto">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="What topics would you like to create flashcards from?"
                                disabled={isGenerating}
                                className="flex-1 input-field"
                            />
                            <button
                                type="submit"
                                disabled={isGenerating || !message.trim()}
                                className={`
                                    px-6 py-3 rounded-xl font-semibold transition-all duration-300
                                    ${isGenerating || !message.trim()
                                    ? 'bg-gray-600/30 text-gray-400 cursor-not-allowed'
                                    : 'btn-primary hover:scale-105'
                                }
                                `}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // FlashCard View
    const currentCard = flashcards[currentCardIndex];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="glass-effect border-b border-indigo-400/30 p-4 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={backToChat}
                            className="mr-4 p-2 hover:bg-indigo-500/20 rounded-full transition-all duration-300 text-indigo-200 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-indigo-100">FlashCards</h1>
                            <p className="text-sm text-indigo-300">
                                {currentCardIndex + 1} / {flashcards.length}
                            </p>
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
                    <div className="w-full bg-indigo-900/30 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* FlashCard */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    <div className="relative h-96 perspective-1000">
                        <div
                            onClick={flipCard}
                            className={`
                                absolute inset-0 w-full h-full cursor-pointer transition-transform duration-700 transform-style-preserve-3d
                                ${isFlipped ? 'rotate-y-180' : ''}
                            `}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden glass-effect rounded-2xl p-8 flex items-center justify-center neon-glow">
                                <div className="text-center">
                                    <div className="mb-4 text-indigo-300">
                                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-semibold text-indigo-100 leading-relaxed">
                                        {currentCard.front}
                                    </h2>
                                    <p className="text-indigo-300 text-sm mt-4">Click to flip the card</p>
                                </div>
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 glass-effect rounded-2xl p-8 flex items-center justify-center border border-green-400/30">
                                <div className="text-center">
                                    <div className="mb-4 text-green-400">
                                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg md:text-xl text-green-300 leading-relaxed">
                                        {currentCard.back}
                                    </h2>
                                    <p className="text-indigo-300 text-sm mt-4">Click to flip the card</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8">
                        <button
                            onClick={prevCard}
                            className="btn-secondary"
                            disabled={flashcards.length <= 1}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        <div className="flex space-x-2">
                            {flashcards.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentCardIndex(index);
                                        setIsFlipped(false);
                                    }}
                                    className={`
                                        w-3 h-3 rounded-full transition-all duration-300
                                        ${index === currentCardIndex
                                        ? 'bg-indigo-500 shadow-lg'
                                        : 'bg-indigo-700/30 hover:bg-indigo-600/50'
                                    }
                                    `}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextCard}
                            className="btn-secondary"
                            disabled={flashcards.length <= 1}
                        >
                            Next
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="text-center mt-8">
                        <button
                            onClick={backToChat}
                            className="btn-secondary"
                        >
                            Create New FlashCards
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashCardInterface;