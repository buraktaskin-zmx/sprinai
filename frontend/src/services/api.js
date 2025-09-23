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

    // YENİ: Quiz değerlendirmesi
    evaluateQuiz: async (questions, answers, username = 'burak') => {
        try {
            console.log('Evaluating quiz with:', { questions: questions.length, answers });

            const response = await api.post('/quiz/evaluate', {
                questions: questions,
                answers: answers,
                username: username
            });

            console.log('Quiz evaluation response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Quiz evaluation error:', error);
            throw error;
        }
    },

    // YENİ: Yanlış cevap analizi
    analyzeMistakes: async (wrongAnswers, username = 'burak') => {
        try {
            console.log('Analyzing mistakes with:', { wrongAnswers: wrongAnswers.length });

            const response = await api.post('/quiz/analyzeMistakes', {
                wrongAnswers: wrongAnswers,
                username: username
            });

            console.log('Mistake analysis response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Mistake analysis error:', error);
            throw error;
        }
    }
};

export default api;