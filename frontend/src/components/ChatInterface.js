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

    // Welcome message
    useEffect(() => {
        const welcomeMessage = {
            id: Date.now(),
            text: `Hello! ${document.name} has been analyzed. You can ask questions about your document.`,
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    }, [document.name]);

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
                text: 'Sorry, an error occurred. Please try again.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Smart Chat
                            </h1>
                            <p className="text-sm text-indigo-300">{document.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onStartOver}
                        className="btn-secondary text-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        New Document
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm
                                ${message.sender === 'user'
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                                : 'bg-white/10 border border-indigo-400/30 text-indigo-100'
                            }
                            `}>
                                <div className="text-sm md:text-base leading-relaxed">
                                    {message.text}
                                </div>
                                <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-indigo-200' : 'text-indigo-400'}`}>
                                    {formatTime(message.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Streaming Message */}
                    {streamingMessage && (
                        <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm bg-white/10 border border-indigo-400/30 text-indigo-100">
                                <div className="text-sm md:text-base leading-relaxed">
                                    {streamingMessage}
                                    <span className="inline-block w-2 h-5 bg-indigo-400 ml-1 animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && !streamingMessage && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm bg-white/10 border border-indigo-400/30">
                                <div className="flex items-center space-x-2 text-indigo-300">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                    <span className="text-sm">AI is typing...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="glass-effect border-t border-indigo-400/30 p-4 backdrop-blur-xl">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask a question about your document..."
                            disabled={isLoading}
                            className="flex-1 input-field"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim()}
                            className={`
                                px-6 py-3 rounded-xl font-semibold transition-all duration-300
                                ${isLoading || !inputMessage.trim()
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
};

export default ChatInterface;