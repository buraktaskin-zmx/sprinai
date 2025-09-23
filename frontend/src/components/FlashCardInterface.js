// frontend/src/components/FlashCardInterface.js
import React, { useState } from 'react';
import { chatService } from '../services/api';

const FlashCardInterface = ({ document, onBack, onStartOver }) => {
    const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'cards'
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [flashcards, setFlashcards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const handleGenerateFlashCards = async (e) => {
        e.preventDefault();
        if (!message.trim() || isGenerating) return;

        // Add user message to chat
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
                    text: 'FlashCard oluşturulamadı. Lütfen talebinizi daha detaylı yazın.',
                    sender: 'bot',
                    timestamp: new Date()
                };
                setChatHistory(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: 'FlashCard oluşturulurken hata oluştu. Lütfen tekrar deneyin.',
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

    if (currentView === 'chat') {
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
                                <h1 className="text-xl font-bold text-gray-800">FlashCard Oluşturucu</h1>
                                <p className="text-sm text-gray-600">{document.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onStartOver}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Yeni doküman
                        </button>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="max-w-4xl mx-auto">
                        {chatHistory.length === 0 && (
                            <div className="text-center text-gray-500 mt-12">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="mb-4">Merhaba! {document.name} dokümanından nasıl bir flashcard seti oluşturmamı istiyorsunuz?</p>
                                <div className="text-sm text-gray-400 space-y-2">
                                    <p><strong>Örnekler:</strong></p>
                                    <p>• "Matematik formüllerini içeren flashcard'lar oluştur"</p>
                                    <p>• "İngilizce kelimeler ve Türkçe anlamları"</p>
                                    <p>• "Tarihsel olaylar ve tarihleri"</p>
                                    <p>• "Kavramlar ve tanımları"</p>
                                </div>
                            </div>
                        )}

                        {chatHistory.map((msg) => (
                            <div
                                key={msg.id}
                                className={`mb-6 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm
                                    ${msg.sender === 'user'
                                    ? 'bg-purple-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border'
                                }
                                `}>
                                    <p className="text-sm">{msg.text}</p>
                                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isGenerating && (
                            <div className="mb-6 flex justify-start">
                                <div className="bg-white rounded-lg rounded-bl-none px-4 py-3 border shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="loading-dots flex space-x-1">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                        </div>
                                        <span className="text-sm text-gray-600">FlashCard'lar oluşturuluyor...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input */}
                <div className="bg-white border-t p-4">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleGenerateFlashCards} className="flex space-x-3">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Nasıl bir FlashCard seti istiyorsunuz? (örn: matematik formülleri, kelime çevirileri...)"
                                disabled={isGenerating}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                            />
                            <button
                                type="submit"
                                disabled={isGenerating || !message.trim()}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Oluştur
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // FlashCard View
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-lg p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={backToChat}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">FlashCard Çalışması</h1>
                            <p className="text-sm text-gray-600">{currentCardIndex + 1} / {flashcards.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={backToChat}
                            className="text-sm text-purple-600 hover:text-purple-700 underline"
                        >
                            Yeni FlashCard Oluştur
                        </button>
                        <button
                            onClick={onStartOver}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Yeni doküman
                        </button>
                    </div>
                </div>
            </div>

            {/* FlashCard */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <div className="relative">
                        <div
                            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                            onClick={flipCard}
                        >
                            <div className="flashcard-inner">
                                <div className="flashcard-front">
                                    <div className="text-center p-8">
                                        <div className="text-sm text-purple-600 font-semibold mb-4">ÖN YÜZ</div>
                                        <div className="text-2xl font-bold text-gray-800 mb-6">
                                            {flashcards[currentCardIndex]?.front}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Kartı çevirmek için tıklayın
                                        </div>
                                    </div>
                                </div>
                                <div className="flashcard-back">
                                    <div className="text-center p-8">
                                        <div className="text-sm text-green-600 font-semibold mb-4">ARKA YÜZ</div>
                                        <div className="text-xl text-gray-800 mb-6">
                                            {flashcards[currentCardIndex]?.back}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Kartı çevirmek için tıklayın
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center space-x-6 mt-8">
                        <button
                            onClick={prevCard}
                            disabled={flashcards.length <= 1}
                            className="flex items-center px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Önceki
                        </button>

                        <button
                            onClick={flipCard}
                            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-purple-700 transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Çevir
                        </button>

                        <button
                            onClick={nextCard}
                            disabled={flashcards.length <= 1}
                            className="flex items-center px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sonraki
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="bg-white rounded-full p-1 shadow-inner">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashCardInterface;