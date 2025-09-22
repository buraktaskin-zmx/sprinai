import React from 'react';

const Message = ({ message }) => {
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageClass = () => {
        switch (message.sender) {
            case 'user':
                return 'message user';
            case 'system':
                return 'message system';
            default:
                return 'message bot';
        }
    };

    return (
        <div className={getMessageClass()}>
            <div className="message-content">
                {message.text}
            </div>
            <div className="message-time">
                {formatTime(message.timestamp)}
            </div>
        </div>
    );
};

export default Message;