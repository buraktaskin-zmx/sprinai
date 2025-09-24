import React from 'react';

const OptionSelector = ({ document, onOptionSelect, onStartOver }) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const options = [
        {
            id: 'chat',
            title: 'Smart Chat',
            description: 'Ask questions about your document and get detailed answers',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            gradient: 'from-blue-600 to-indigo-600',
            hoverGradient: 'from-blue-500 to-indigo-500'
        },
        {
            id: 'quiz',
            title: '🎯 Test Yourself',
            description: 'Generate quizzes from your document and test your knowledge - with question count and difficulty options',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            gradient: 'from-indigo-600 to-violet-600',
            hoverGradient: 'from-indigo-500 to-violet-500',
            isSpecial: true // For special styling
        },
        {
            id: 'flashcard',
            title: 'FlashCards',
            description: 'Create flashcards for effective learning and memorization',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            gradient: 'from-violet-600 to-blue-600',
            hoverGradient: 'from-violet-500 to-blue-500'
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-400/30 mb-6 neon-glow">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-indigo-100 mb-4">
                        Document Successfully Uploaded! 🎉
                    </h1>

                    <div className="card max-w-md mx-auto p-6">
                        <div className="flex items-center justify-center mb-3">
                            <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-indigo-100">{document.name}</p>
                                <p className="text-sm text-indigo-300">{formatFileSize(document.size)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Options Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            onClick={() => onOptionSelect(option.id)}
                            className={`
                                group cursor-pointer transition-all duration-300
                                ${option.isSpecial ? 'transform hover:scale-110' : 'hover:scale-105'}
                            `}
                        >
                            <div className={`
                                card p-8 text-center transition-all duration-300 
                                group-hover:neon-glow group-hover:bg-white/15
                                ${option.isSpecial ? 'ring-2 ring-yellow-400/50 bg-gradient-to-br from-yellow-900/10 to-orange-900/10' : ''}
                            `}>
                              

                                <div className={`
                                    w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${option.gradient} 
                                    group-hover:bg-gradient-to-r group-hover:${option.hoverGradient} 
                                    flex items-center justify-center text-white transition-all duration-300 
                                    shadow-lg group-hover:shadow-xl
                                    ${option.isSpecial ? 'animate-pulse' : ''}
                                `}>
                                    {option.icon}
                                </div>

                                <h3 className={`
                                    text-xl font-bold mb-3 group-hover:text-white transition-colors
                                    ${option.isSpecial ? 'text-yellow-200' : 'text-indigo-100'}
                                `}>
                                    {option.title}
                                </h3>

                                <p className={`
                                    leading-relaxed transition-colors
                                    ${option.isSpecial ? 'text-yellow-100/90' : 'text-indigo-300 group-hover:text-indigo-200'}
                                `}>
                                    {option.description}
                                </p>

                                {option.isSpecial && (
                                    <div className="mt-4 flex justify-center space-x-2">
                                        <span className="inline-block px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">3-7 questions</span>
                                        <span className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">Easy-Hard</span>
                                        <span className="inline-block px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">AI Analysis</span>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <div className={`
                                        inline-flex items-center text-sm font-medium transition-all duration-300
                                        ${option.isSpecial ? 'text-yellow-200 group-hover:text-yellow-100' : 'text-indigo-200 group-hover:text-white'}
                                    `}>
                                        {option.isSpecial ? '🚀 Start Now' : 'Get Started'}
                                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onStartOver}
                        className="btn-secondary"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload New Document
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OptionSelector;
