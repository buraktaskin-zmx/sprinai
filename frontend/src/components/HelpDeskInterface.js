import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';

const HelpDeskInterface = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userName] = useState('burak'); // Default username
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Welcome message when component mounts
    useEffect(() => {
        const welcomeMessage = {
            id: Date.now(),
            text: `👋 Hello! I'm your StudentMate AI Support Assistant. I'm here to help you with any issues or questions about the app. 

You can:
• Report technical problems
• Ask for help with features
• Request new tickets for issues
• Check your existing ticket status

How can I help you today?`,
            sender: 'assistant',
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    }, []);

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
            const response = await chatService.sendHelpDeskMessage(inputMessage, userName);

            const assistantMessage = {
                id: Date.now() + 1,
                text: response,
                sender: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Help desk error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: '❌ Sorry, I encountered an error. Please try again or contact support directly.',
                sender: 'assistant',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const quickActions = [
        "🔧 Document upload is not working",
        "❓ How do I create a quiz?",
        "📱 App is running slowly",
        "💾 I can't save my progress",
        "🔍 Search feature isn't working"
    ];

    const handleQuickAction = (action) => {
        setInputMessage(action);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-effect rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col border border-indigo-400/30">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-indigo-400/30">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-indigo-100">Help & Support</h2>
                            <p className="text-sm text-indigo-300">StudentMate AI Assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-indigo-500/20 rounded-full transition-all duration-300 text-indigo-200 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm
                                ${message.sender === 'user'
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                                : 'bg-white/10 border border-indigo-400/30 text-indigo-100'
                            }
                            `}>
                                <div className="text-sm md:text-base leading-relaxed whitespace-pre-line">
                                    {message.text}
                                </div>
                                <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-indigo-200' : 'text-indigo-400'}`}>
                                    {formatTime(message.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm bg-white/10 border border-indigo-400/30">
                                <div className="flex items-center space-x-2 text-indigo-300">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                    <span className="text-sm">Assistant is typing...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                    <div className="px-6 pb-4">
                        <p className="text-sm text-indigo-300 mb-3">💡 Quick actions (click to use):</p>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action)}
                                    className="text-sm px-3 py-2 bg-white/10 border border-indigo-400/30 rounded-lg text-indigo-200 hover:bg-indigo-500/20 hover:text-white transition-all duration-300"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-indigo-400/30 p-6">
                    <form onSubmit={handleSendMessage}>
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Describe your issue or ask for help..."
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
        </div>
    );
};

export default HelpDeskInterface;