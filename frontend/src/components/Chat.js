import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import DocumentUpload from './DocumentUpload';
import Message from './Message';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [username] = useState('burak');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            const response = await chatService.sendMessage(inputMessage, username);

            const botMessage = {
                id: Date.now() + 1,
                text: response,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDocumentUploaded = (message) => {
        const uploadMessage = {
            id: Date.now(),
            text: message,
            sender: 'system',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, uploadMessage]);
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Dokuman Chat</h2>
                <DocumentUpload
                    username={username}
                    onDocumentUploaded={handleDocumentUploaded}
                />
            </div>

            <div className="messages-container">
                {messages.length === 0 && (
                    <div className="loading">
                        Merhaba! Dokumentlarınız hakkında soru sorabilirsiniz.
                    </div>
                )}

                {messages.map((message) => (
                    <Message key={message.id} message={message} />
                ))}

                {isLoading && (
                    <div className="loading">
                        Bot yazıyor...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Dokumentlarınız hakkında bir soru sorun..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !inputMessage.trim()}>
                    Gönder
                </button>
            </form>
        </div>
    );
};

export default Chat;