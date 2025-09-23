package com.burak.openai.controller;

import com.burak.openai.model.QuizMistakeAnalysis;
import com.burak.openai.model.QuizResultRequest;
import com.burak.openai.model.QuizResultResponse;
import com.burak.openai.model.WrongAnswer;
import com.burak.openai.rag.UserDocumentRetriever;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizResultController {
	
	private final ChatClient chatClient;
	
	public QuizResultController(@Qualifier("quizChatClient") ChatClient chatClient) {
		this.chatClient = chatClient;
	}
	
	@PostMapping("/evaluate")
	public ResponseEntity<QuizResultResponse> evaluateQuiz(@RequestBody QuizResultRequest request) {
		try {
			List<WrongAnswer> wrongAnswers = new ArrayList<>();
			
			// Yanlış cevapları belirle
			for (int i = 0; i < request.getQuestions().size(); i++) {
				var question = request.getQuestions().get(i);
				Integer studentAnswer = request.getAnswers().get(i);
				
				if (studentAnswer == null || !studentAnswer.equals(question.getCorrectAnswer())) {
					WrongAnswer wrongAnswer = new WrongAnswer(
						i + 1, // questionNumber (1-based)
						question.getQuestion(),
						getAnswerText(question.getOptions(), question.getCorrectAnswer()),
						studentAnswer != null ? getAnswerText(question.getOptions(), studentAnswer) : "Cevaplanmadı"
					);
					wrongAnswers.add(wrongAnswer);
				}
			}
			
			// Doğru cevap sayısını hesapla
			int correctCount = request.getQuestions().size() - wrongAnswers.size();
			
			QuizResultResponse response = new QuizResultResponse(
				request.getQuestions().size(),
				correctCount,
				wrongAnswers.size(),
				wrongAnswers
			);
			
			return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	@PostMapping("/analyzeMistakes")
	public ResponseEntity<QuizMistakeAnalysis> analyzeMistakes(@RequestBody Map<String, Object> request) {
		try {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> wrongAnswers = (List<Map<String, Object>>) request.get("wrongAnswers");
			String username = (String) request.getOrDefault("username", "burak");
			
			if (wrongAnswers == null || wrongAnswers.isEmpty()) {
				return ResponseEntity.ok(new QuizMistakeAnalysis(
					"Tebrikler! Tüm soruları doğru yanıtladınız. Harika bir performans sergiledınız!"
				));
			}
			
			// Set current username for retriever
			UserDocumentRetriever.setCurrentUsername(username);
			
			// Yanlış sorular hakkında analiz prompt'u oluştur
			StringBuilder promptBuilder = new StringBuilder();
			promptBuilder.append("Öğrenci aşağıdaki soruları yanlış yanıtlamış. Dokümandan yola çıkarak, ");
			promptBuilder.append("öğrencinin hangi konularda eksik olduğunu analiz et ve ne çalışması gerektiğini öner.\n\n");
			promptBuilder.append("YANLIŞ YANITLANAN SORULAR:\n");
			
			for (Map<String, Object> wrongAnswer : wrongAnswers) {
				promptBuilder.append("Soru ").append(wrongAnswer.get("questionNumber")).append(": ")
					.append(wrongAnswer.get("questionText")).append("\n");
				promptBuilder.append("Doğru Cevap: ").append(wrongAnswer.get("correctAnswer")).append("\n");
				promptBuilder.append("Öğrencinin Cevabı: ").append(wrongAnswer.get("studentAnswer")).append("\n\n");
			}
			
			promptBuilder.append("Lütfen:\n");
			promptBuilder.append("1. Bu yanlış cevaplardan hangi konularda eksiklik olduğunu belirt\n");
			promptBuilder.append("2. Bu konuları öğrenmek için somut öneriler ver\n");
			promptBuilder.append("3. Dokümanın hangi bölümlerini tekrar okuması gerektiğini söyle\n");
			promptBuilder.append("4. Motivasyon verici bir dille, yapıcı ve yardımcı ol\n");
			
			String analysis = chatClient.prompt()
				.user(promptBuilder.toString())
				.call()
				.content();
			
			return ResponseEntity.ok(new QuizMistakeAnalysis(analysis));
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError()
				.body(new QuizMistakeAnalysis("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin."));
		} finally {
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
	
	private String getAnswerText(Map<String, String> options, int answerIndex) {
		String[] keys = {"A", "B", "C", "D"};
		if (answerIndex >= 0 && answerIndex < keys.length) {
			String key = keys[answerIndex];
			return key + ") " + options.get(key);
		}
		return "Bilinmeyen cevap";
	}
}