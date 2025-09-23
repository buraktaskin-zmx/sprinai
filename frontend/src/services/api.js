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

    // Ana quiz generation method - structured output kullanır
    generateQuizRAG: async (username = 'burak', questionCount = 5, difficulty = 'orta') => {
        try {
            console.log('Calling structured quiz API with:', { username, questionCount, difficulty });

            const response = await api.post('/quiz/generate-structured', {
                username: username,
                questionCount: questionCount,
                difficulty: difficulty
            });

            console.log('Structured quiz API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Quiz RAG generation error:', error);
            throw error;
        }
    },

    // Fallback method - aynı endpoint'i kullanır
    generateQuiz: async (username = 'burak', questionCount = 5, difficulty = 'orta') => {
        try {
            console.log('Calling fallback quiz API with:', { username, questionCount, difficulty });

            // generate-structured endpoint'i kullan (backend'de tüm endpoint'ler aynı method'a yönlendiriliyor)
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

    // GÜNCELLENMIŞ: Quiz değerlendirmesi
    evaluateQuiz: async (questions, answers, username = 'burak') => {
        try {
            console.log('=== QUIZ EVALUATION API CALL ===');
            console.log('Questions count:', questions.length);
            console.log('Answers:', answers);
            console.log('Username:', username);

            // Backend'in beklediği formata çevir
            const formattedQuestions = questions.map((q, index) => {
                const questionData = {
                    question: q.question,
                    options: q.originalOptions || { // originalOptions varsa kullan, yoksa parse et
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

    // GÜNCELLENMIŞ: Yanlış cevap analizi
    analyzeMistakes: async (wrongAnswers, username = 'burak') => {
        try {
            console.log('=== MISTAKE ANALYSIS API CALL ===');
            console.log('Wrong answers count:', wrongAnswers.length);
            console.log('Username:', username);
            console.log('Wrong answers data:', wrongAnswers);

            const requestData = {
                wrongAnswers: wrongAnswers,
                username: username
            };

            const response = await api.post('/quiz/analyzeMistakes', requestData);

            console.log('Mistake analysis response:', response.data);

            // Backend'den gelen response formatına göre analizi döndür
            return response.data.analysis || response.data;
        } catch (error) {
            console.error('Mistake analysis error:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    },

    generateFlashCards: async (message, username = 'burak', cardCount = 10) => {
        try {
            console.log('Generating flashcards with:', { message, username, cardCount });

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