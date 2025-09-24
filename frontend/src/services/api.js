import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatService = {
    sendMessage: async (message, username = 'burak') => {
        try {
            const response = await api.post('/user-documents/chat', {
                message: message,
                username: username
            });
            return response.data;
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    },

    uploadDocument: async (file, username = 'burak') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('username', username);

        try {
            const response = await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },

    // Enhanced quiz generation with quiz settings support
    generateQuizRAG: async (username = 'burak', questionCount = 5, difficulty = 'medium') => {
        try {
            console.log('Calling enhanced quiz API with settings:', { username, questionCount, difficulty });

            // Validate question count
            if (questionCount < 3 || questionCount > 10) {
                throw new Error('Question count must be between 3 and 10');
            }

            // Validate difficulty
            const validDifficulties = ['easy', 'medium', 'hard'];
            if (!validDifficulties.includes(difficulty)) {
                throw new Error('Difficulty must be easy, medium, or hard');
            }

            const response = await api.post('/quiz/generate-structured', {
                username: username,
                questionCount: questionCount,
                difficulty: difficulty
            });

            console.log('Enhanced quiz API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Quiz RAG generation error:', error);
            throw error;
        }
    },

    // Fallback quiz generation with settings
    generateQuiz: async (username = 'burak', questionCount = 5, difficulty = 'medium') => {
        try {
            console.log('Calling fallback quiz API with settings:', { username, questionCount, difficulty });

            const response = await api.post('/quiz/generate-structured', {
                username: username,
                questionCount: questionCount,
                difficulty: difficulty
            });

            console.log('Fallback quiz API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Quiz generation error:', error);
            throw error;
        }
    },

    // Enhanced quiz evaluation
    evaluateQuiz: async (questions, answers, username = 'burak') => {
        try {
            console.log('=== ENHANCED QUIZ EVALUATION API CALL ===');
            console.log('Questions count:', questions.length);
            console.log('Answers:', answers);
            console.log('Username:', username);

            const formattedQuestions = questions.map((q, index) => {
                const questionData = {
                    question: q.question,
                    options: q.originalOptions || {
                        A: q.options[0]?.replace(/^A\)\s*/, ''),
                        B: q.options[1]?.replace(/^B\)\s*/, ''),
                        C: q.options[2]?.replace(/^C\)\s*/, ''),
                        D: q.options[3]?.replace(/^D\)\s*/, '')
                    },
                    correctAnswer: q.correctAnswer
                };

                console.log(`Question ${index + 1} formatted:`, questionData);
                return questionData;
            });

            const requestData = {
                questions: formattedQuestions,
                answers: answers
            };

            console.log('Sending evaluation request:', requestData);

            const response = await api.post('/quiz/evaluate', requestData);

            console.log('Quiz evaluation response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Quiz evaluation error:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    },

    // Enhanced mistake analysis with web resources
    analyzeMistakesWithWebResources: async (wrongAnswers, username = 'burak') => {
        try {
            console.log('=== ENHANCED MISTAKE ANALYSIS API CALL ===');
            console.log('Wrong answers count:', wrongAnswers.length);
            console.log('Username:', username);
            console.log('Wrong answers data:', wrongAnswers);

            const requestData = {
                wrongAnswers: wrongAnswers,
                username: username
            };

            const response = await api.post('/quiz/analyzeMistakes', requestData);

            console.log('Enhanced mistake analysis response:', response.data);

            // Return the enhanced response with web resources
            return {
                analysis: response.data.analysis || response.data,
                webResources: response.data.webResources || [],
                canSaveReport: response.data.canSaveReport || false,
                reportData: response.data.reportData || null
            };
        } catch (error) {
            console.error('Enhanced mistake analysis error:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    },

    // Save quiz report using MCP file server
    saveQuizReport: async (reportRequest) => {
        try {
            console.log('=== SAVE QUIZ REPORT API CALL ===');
            console.log('Report request:', reportRequest);

            const response = await api.post('/quiz/saveReport', reportRequest);

            console.log('Save report response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Save report error:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    },

    // Legacy mistake analysis (fallback)
    analyzeMistakes: async (wrongAnswers, username = 'burak') => {
        try {
            console.log('=== LEGACY MISTAKE ANALYSIS API CALL ===');
            console.log('Wrong answers count:', wrongAnswers.length);
            console.log('Username:', username);

            const requestData = {
                wrongAnswers: wrongAnswers,
                username: username
            };

            const response = await api.post('/quiz/analyzeMistakes', requestData);

            console.log('Legacy mistake analysis response:', response.data);
            return response.data.analysis || response.data;
        } catch (error) {
            console.error('Legacy mistake analysis error:', error);
            throw error;
        }
    },

    // Flashcard generation with settings
    generateFlashCards: async (message, username = 'burak', cardCount = 10) => {
        try {
            console.log('Generating flashcards with settings:', { message, username, cardCount });

            // Validate card count
            if (cardCount < 5 || cardCount > 20) {
                throw new Error('Card count must be between 5 and 20');
            }

            const response = await api.post('/flashcards/generate', {
                message: message,
                username: username,
                cardCount: cardCount
            });

            console.log('FlashCard API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('FlashCard generation error:', error);
            throw error;
        }
    }
};

export default api;