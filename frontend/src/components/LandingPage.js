import React, { useState, useEffect } from 'react';
import { chatService } from '../services/api';

const LandingPage = ({ onDocumentUploaded }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);

    useEffect(() => {
        // Animation complete after 2 seconds
        const timer = setTimeout(() => {
            setIsAnimationComplete(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // File type validation
        const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setUploadStatus({
                type: 'error',
                message: 'Only PDF, TXT, and Word documents are supported.'
            });
            return;
        }

        // File size validation (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadStatus({
                type: 'error',
                message: 'File size must be less than 10MB.'
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
                message: 'An error occurred while uploading the file. Please try again.'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative page-enter">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="text-center max-w-4xl mx-auto relative z-10">
                {/* Logo/Icon */}
                <div className="mb-8 floating">
                    <div className="w-24 h-24 mx-auto mb-6 glass-effect rounded-full flex items-center justify-center neon-glow logo-animate">
                        <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                </div>

                {/* Main Title */}
                <div className="mb-12 content-animate">
                    <h3 className="text-xl md:text-2xl font-semibold text-indigo-300 mb-4">
                        Learn Smarter, Achieve Faster!
                    </h3>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
                        StudentMate AI
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-semibold text-indigo-200 mb-4">
                        Your Intelligent Study Companion
                    </h2>
                    <p className="text-lg md:text-xl text-indigo-100/80 max-w-2xl mx-auto leading-relaxed">
                        Upload your documents and interact with AI.
                        Ask questions, create quizzes, or study with flashcards.
                    </p>
                </div>

                {/* Upload Area */}
                <div className="relative mb-8 content-animate">
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
                            relative group cursor-pointer block
                            ${isUploading ? 'cursor-not-allowed' : ''}
                        `}
                    >
                        <div className={`
                            glass-effect rounded-2xl p-12 border-2 border-dashed transition-all duration-300
                            ${isUploading
                            ? 'border-indigo-400/30 bg-indigo-900/20'
                            : 'border-indigo-400/50 hover:border-indigo-300 hover:bg-indigo-900/30 hover:scale-105'
                        }
                            animated-border
                        `}>
                            <div className="text-center">
                                {isUploading ? (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 mx-auto">
                                            <div className="w-full h-full border-4 border-indigo-300/30 border-t-indigo-400 rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-indigo-200 text-lg">Uploading document<span className="loading-dots"></span></p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 mx-auto text-indigo-300 group-hover:text-indigo-200 transition-colors">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xl font-semibold text-indigo-200 mb-2">
                                                Drag your document here
                                            </p>
                                            <p className="text-indigo-300/80">
                                                or <span className="text-indigo-200 font-medium">click to select a file</span>
                                            </p>
                                            <p className="text-sm text-indigo-400/70 mt-2">
                                                Supports PDF, DOC, DOCX, TXT formats (Max: 10MB)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </label>
                </div>

                {/* Status Message */}
                {uploadStatus && (
                    <div className={`
                        card max-w-md mx-auto p-4 ${uploadStatus.type === 'error'
                        ? 'bg-red-500/20 border border-red-400/30 text-red-200'
                        : 'bg-green-500/20 border border-green-400/30 text-green-200'
                    }
                    `}>
                        <div className="flex items-center justify-center">
                            {uploadStatus.type === 'error' ? (
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {uploadStatus.message}
                        </div>
                    </div>
                )}

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mt-16">
                    <div className={`card text-center hover:neon-glow feature-animate`}>
                        <div className="w-12 h-12 mx-auto mb-4 text-indigo-300">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-indigo-200 mb-2">Smart Chat</h3>
                        <p className="text-indigo-300/70 text-sm">Ask questions about your document and get detailed answers</p>
                    </div>

                    <div className={`card text-center hover:neon-glow feature-animate`}>
                        <div className="w-12 h-12 mx-auto mb-4 text-indigo-300">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-indigo-200 mb-2">Auto Quiz</h3>
                        <p className="text-indigo-300/70 text-sm">Generate quizzes from content and test your knowledge</p>
                    </div>

                    <div className={`card text-center hover:neon-glow feature-animate`}>
                        <div className="w-12 h-12 mx-auto mb-4 text-indigo-300">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-indigo-200 mb-2">FlashCards</h3>
                        <p className="text-indigo-300/70 text-sm">Create flashcards for effective learning and memorization</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;