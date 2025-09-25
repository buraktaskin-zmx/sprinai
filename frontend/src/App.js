import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import OptionSelector from './components/OptionSelector';
import ChatInterface from './components/ChatInterface';
import QuizInterface from './components/QuizInterface';
import FlashCardInterface from './components/FlashCardInterface';
import HelpDeskInterface from './components/HelpDeskInterface';

function App() {
    const [currentView, setCurrentView] = useState('landing');
    const [uploadedDocument, setUploadedDocument] = useState(null);
    const [showHelpDesk, setShowHelpDesk] = useState(false);

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

    const handleOpenHelpDesk = () => {
        setShowHelpDesk(true);
    };

    const handleCloseHelpDesk = () => {
        setShowHelpDesk(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-violet-900"></div>

            {/* Particle Effect */}
            <div className="particles"></div>

            {/* Animated Gradient Overlay */}
            <div className="fixed inset-0 bg-gradient-to-r from-indigo-600/20 via-transparent to-blue-600/20 animate-pulse"></div>

            {/* Help Desk Button - Fixed Position */}
            <button
                onClick={handleOpenHelpDesk}
                className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 group"
                title="Need Help? Click here for support"
            >
                <div className="glass-effect bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-400/30 neon-glow">
                    <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-white font-semibold text-sm hidden group-hover:block transition-all duration-300">
                            Need Help?
                        </span>
                    </div>
                </div>
            </button>

            {/* Help Desk Pulse Animation */}
            <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none">
                <div className="w-16 h-16 bg-amber-400/20 rounded-full animate-ping"></div>
            </div>

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

            {/* Help Desk Interface Overlay */}
            {showHelpDesk && (
                <HelpDeskInterface onClose={handleCloseHelpDesk} />
            )}
        </div>
    );
}

export default App;