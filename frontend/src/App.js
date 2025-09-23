import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import OptionSelector from './components/OptionSelector';
import ChatInterface from './components/ChatInterface';
import QuizInterface from './components/QuizInterface';
import FlashCardInterface from './components/FlashCardInterface';

function App() {
    const [currentView, setCurrentView] = useState('landing');
    const [uploadedDocument, setUploadedDocument] = useState(null);

    // Particle effect
    useEffect(() => {
        const createParticles = () => {
            const particleContainer = document.querySelector('.particles');
            if (!particleContainer) return;

            // Clear existing particles
            particleContainer.innerHTML = '';

            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                particleContainer.appendChild(particle);
            }
        };

        createParticles();
    }, []);

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
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-violet-900"></div>

            {/* Particle Effect */}
            <div className="particles"></div>

            {/* Animated Gradient Overlay */}
            <div className="fixed inset-0 bg-gradient-to-r from-indigo-600/20 via-transparent to-blue-600/20 animate-pulse"></div>

            {/* Main Content */}
            <div className="relative z-10">
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

                {currentView === 'flashcard' && (
                    <FlashCardInterface
                        document={uploadedDocument}
                        onBack={handleBackToOptions}
                        onStartOver={handleStartOver}
                    />
                )}
            </div>
        </div>
    );
}

export default App;