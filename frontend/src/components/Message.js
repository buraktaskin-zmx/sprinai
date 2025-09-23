import React from 'react';

const Message = ({ message }) => {
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageStyles = () => {
        switch (message.sender) {
            case 'user':
                return {
                    container: 'justify-end',
                    bubble: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg',
                    time: 'text-indigo-200'
                };
            case 'system':
                return {
                    container: 'justify-center',
                    bubble: 'bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 text-green-200 shadow-lg',
                    time: 'text-green-400'
                };
            default:
                return {
                    container: 'justify-start',
                    bubble: 'bg-white/10 border border-indigo-400/30 text-indigo-100 backdrop-blur-sm shadow-lg',
                    time: 'text-indigo-400'
                };
        }
    };

    const styles = getMessageStyles();

    return (
        <div className={`flex ${styles.container} mb-4`}>
            <div className={`
                max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105
                ${styles.bubble}
            `}>
                <div className="text-sm md:text-base leading-relaxed">
                    {message.text}
                </div>
                <div className={`text-xs mt-2 ${styles.time}`}>
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    );
};

export default Message;