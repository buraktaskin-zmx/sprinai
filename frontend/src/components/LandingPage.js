import React, { useState } from 'react';
import { chatService } from '../services/api';

const LandingPage = ({ onDocumentUploaded }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Dosya tipini kontrol et
        const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setUploadStatus({
                type: 'error',
                message: 'Sadece PDF, TXT ve Word dosyaları desteklenmektedir.'
            });
            return;
        }

        // Dosya boyutunu kontrol et (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadStatus({
                type: 'error',
                message: 'Dosya boyutu 10MB\'dan küçük olmalıdır.'
            });
            return;
        }

        setIsUploading(true);
        setUploadStatus(null);

        try {
            await chatService.uploadDocument(file, 'burak');

            const docInfo = {
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date()
            };

            onDocumentUploaded(docInfo);
        } catch (error) {
            setUploadStatus({
                type: 'error',
                message: 'Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                        Doküman AI
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Dokümanınızı yükleyin ve yapay zeka ile etkileşime geçin.
                        Sorular sorun veya test oluşturun.
                    </p>
                </div>

                <div className="relative">
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.txt,.doc,.docx"
                        className="hidden"
                        id="file-upload"
                        disabled={isUploading}
                    />

                    <label
                        htmlFor="file-upload"
                        className={`
              inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg
              transition-all duration-300 cursor-pointer
              ${isUploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
                        }
              text-white
            `}
                    >
                        {isUploading ? (
                            <>
                                <div className="loading-dots flex space-x-1 mr-3">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                </div>
                                Yükleniyor...
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Doküman Yükle
                            </>
                        )}
                    </label>
                </div>

                {uploadStatus && (
                    <div className={`
            mt-6 p-4 rounded-lg max-w-md mx-auto animate-slide-up
            ${uploadStatus.type === 'error'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }
          `}>
                        {uploadStatus.message}
                    </div>
                )}

                <div className="mt-12 text-sm text-gray-500">
                    <p>Desteklenen formatlar: PDF, TXT, DOC, DOCX</p>
                    <p>Maksimum dosya boyutu: 10MB</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;