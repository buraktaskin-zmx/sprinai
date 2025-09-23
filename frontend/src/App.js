// frontend/src/App.js (UPDATED)
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import OptionSelector from './components/OptionSelector';
import ChatInterface from './components/ChatInterface';
import QuizInterface from './components/QuizInterface';
import FlashCardInterface from './components/FlashCardInterface'; // NEW

function App() {
    const [currentView, setCurrentView] = useState('landing');
    const [uploadedDocument, setUploadedDocument] = useState(null);

    const handleDocumentUploaded = (docInfo) => {
        setUploadedDocument(docInfo);
        setCurrentView('options');
    };

    const handleOptionSelect = (option) => {
        setCurrentView(option);
    };

    const handleBackToOptions = () => {
        setCurrentView('options');
    };

    const handleStartOver = () => {
        setUploadedDocument(null);
        setCurrentView('landing');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {currentView === 'landing' && (
                <LandingPage onDocumentUploaded={handleDocumentUploaded} />
            )}

            {currentView === 'options' && (
                <OptionSelector
                    document={uploadedDocument}
                    onOptionSelect={handleOptionSelect}
                    onStartOver={handleStartOver}
                />
            )}

            {currentView === 'chat' && (
                <ChatInterface
                    document={uploadedDocument}
                    onBack={handleBackToOptions}
                    onStartOver={handleStartOver}
                />
            )}

            {currentView === 'quiz' && (
                <QuizInterface
                    document={uploadedDocument}
                    onBack={handleBackToOptions}
                    onStartOver={handleStartOver}
                />
            )}

            {/* NEW: FlashCard Interface */}
            {currentView === 'flashcard' && (
                <FlashCardInterface
                    document={uploadedDocument}
                    onBack={handleBackToOptions}
                    onStartOver={handleStartOver}
                />
            )}
        </div>
    );
}

export default App;