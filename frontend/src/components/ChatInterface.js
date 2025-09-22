import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';

const ChatInterface = ({ document, onBack, onStartOver }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage]);

    // Simulated streaming effect
    const simulateStreaming = (text) => {
        setStreamingMessage('');
        let index = 0;
        const words = text.split(' ');

        const streamInterval = setInterval(() => {
            if (index < words.length) {
                setStreamingMessage(prev => prev + (index === 0 ? '' : ' ') + words[index]);
                index++;
            } else {
                clearInterval(streamInterval);
                const finalMessage = {
                    id: Date.now(),
                    text: text,
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, finalMessage]);
                setStreamingMessage('');
                setIsLoading(false);
            }
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await chatService.sendMessage(inputMessage, 'burak');
            simulateStreaming(response);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                            <h1 className="text-xl font-bold text-gray-800">Doküman Soru-Cevap</h1>
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto">
                    {messages.length === 0 && !streamingMessage && (
                        <div className="text-center text-gray-500 mt-12">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p>Merhaba! {document.name} hakkında soru sorabilirsiniz.</p>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`mb-6 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm
                ${message.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none border'
                            }
              `}>
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Streaming Message */}
                    {streamingMessage && (
                        <div className="mb-6 flex justify-start">
                            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg rounded-bl-none bg-white text-gray-800 border shadow-sm">
                                <p className="text-sm">{streamingMessage}<span className="animate-pulse">|</span></p>
                            </div>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && !streamingMessage && (
                        <div className="mb-6 flex justify-start">
                            <div className="bg-white rounded-lg rounded-bl-none px-4 py-3 border shadow-sm">
                                <div className="loading-dots flex space-x-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="bg-white border-t p-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex space-x-3">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Doküman hakkında bir soru sorun..."
                            disabled={isLoading}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Gönder
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;