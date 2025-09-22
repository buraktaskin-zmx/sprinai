import React from 'react';

const OptionSelector = ({ document, onOptionSelect, onStartOver }) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl w-full animate-fade-in">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Doküman Başarıyla Yüklendi!
                    </h1>
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
                        <div className="flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-lg font-semibold text-gray-800">{document.name}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{formatFileSize(document.size)}</p>
                    </div>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Chat Option */}
                    <div
                        onClick={() => onOptionSelect('chat')}
                        className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Doküman ile Soru-Cevap
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Yüklediğiniz doküman hakkında sorular sorun ve anında yanıt alın
                            </p>
                            <div className="flex items-center justify-center text-blue-600 font-semibold">
                                <span>Başla</span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Option */}
                    <div
                        onClick={() => onOptionSelect('quiz')}
                        className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Çoktan Seçmeli Test
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Dokümandan otomatik test soruları oluşturun ve kendinizi test edin
                            </p>
                            <div className="flex items-center justify-center text-green-600 font-semibold">
                                <span>Başla</span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Start Over Button */}
                <div className="text-center">
                    <button
                        onClick={onStartOver}
                        className="text-gray-500 hover:text-gray-700 underline transition-colors"
                    >
                        Yeni doküman yükle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OptionSelector;