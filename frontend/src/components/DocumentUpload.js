import React, { useState, useRef } from 'react';
import { chatService } from '../services/api';

const DocumentUpload = ({ username, onDocumentUploaded }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
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
            const response = await chatService.uploadDocument(file, username);

            setUploadStatus({
                type: 'success',
                message: `${file.name} uploaded successfully!`
            });

            onDocumentUploaded(`📄 ${file.name} document uploaded and analyzed.`);

            // Clear status after 3 seconds
            setTimeout(() => {
                setUploadStatus(null);
            }, 3000);

        } catch (error) {
            setUploadStatus({
                type: 'error',
                message: 'An error occurred while uploading the file. Please try again.'
            });
        } finally {
            setIsUploading(false);
            // Clear input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="inline-flex flex-col items-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
            />

            <button
                type="button"
                onClick={handleFileSelect}
                disabled={isUploading}
                className={`
                    btn-secondary text-sm transition-all duration-300
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                `}
            >
                {isUploading ? (
                    <>
                        <div className="w-4 h-4 mr-2 border-2 border-indigo-300/30 border-t-indigo-400 rounded-full animate-spin"></div>
                        Uploading...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        📄 Add Document
                    </>
                )}
            </button>

            {uploadStatus && (
                <div className={`
                    mt-3 px-4 py-2 rounded-lg text-sm max-w-sm text-center transition-all duration-300
                    ${uploadStatus.type === 'success'
                    ? 'bg-green-500/20 border border-green-400/30 text-green-200'
                    : 'bg-red-500/20 border border-red-400/30 text-red-200'
                }
                `}>
                    <div className="flex items-center justify-center">
                        {uploadStatus.type === 'success' ? (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {uploadStatus.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;