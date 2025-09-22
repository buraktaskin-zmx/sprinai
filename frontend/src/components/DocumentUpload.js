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
            const response = await chatService.uploadDocument(file, username);

            setUploadStatus({
                type: 'success',
                message: `${file.name} başarıyla yüklendi!`
            });

            onDocumentUploaded(`📄 ${file.name} dökümanı yüklendi ve analiz edildi.`);

            // 3 saniye sonra status'u temizle
            setTimeout(() => {
                setUploadStatus(null);
            }, 3000);

        } catch (error) {
            setUploadStatus({
                type: 'error',
                message: 'Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
            });
        } finally {
            setIsUploading(false);
            // Input'u temizle
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.doc,.docx"
                className="file-input"
            />

            <button
                type="button"
                onClick={handleFileSelect}
                disabled={isUploading}
                className="upload-btn"
            >
                {isUploading ? 'Yükleniyor...' : '📄 Dokuman Ekle'}
            </button>

            {uploadStatus && (
                <div className={`upload-status ${uploadStatus.type}`}>
                    {uploadStatus.message}
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;