package com.burak.openai.controller;

import com.burak.openai.model.QuizResponse;
import com.burak.openai.rag.UserDocumentRetriever;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {
	
	private final ChatClient quizChatClient;
	private final ChatClient quizFallbackChatClient;
	private final ChatClient quizContentAnalyzerClient;
	private final ObjectMapper objectMapper;
	
	public QuizController(@Qualifier("quizChatClient") ChatClient quizChatClient,
	                      @Qualifier("quizFallbackChatClient") ChatClient quizFallbackChatClient,
	                      @Qualifier("quizContentAnalyzerClient") ChatClient quizContentAnalyzerClient,
	                      ObjectMapper objectMapper) {
		this.quizChatClient = quizChatClient;
		this.quizFallbackChatClient = quizFallbackChatClient;
		this.quizContentAnalyzerClient = quizContentAnalyzerClient;
		this.objectMapper = objectMapper;
	}
	
	@PostMapping("/generate-structured")
	public ResponseEntity<String> generateStructuredQuiz(@RequestBody Map<String, Object> request) {
		String username = (String) request.getOrDefault("username", "burak");
		Integer questionCount = (Integer) request.getOrDefault("questionCount", 5);
		String difficulty = (String) request.getOrDefault("difficulty", "orta");
		
		System.out.println("=== SPECIALIZED QUIZ GENERATION ===");
		System.out.println("Username: " + username);
		System.out.println("Question Count: " + questionCount);
		System.out.println("Difficulty: " + difficulty);
		
		try {
			// Set current username for retriever
			UserDocumentRetriever.setCurrentUsername(username);
			
			// PHASE 1: Content Analysis with specialized client
			System.out.println("Phase 1: Analyzing document content with quizContentAnalyzerClient...");
			String documentContent = quizContentAnalyzerClient.prompt()
				.user("Bu dokümandaki ana konuları, önemli kavramları, tanımları ve quiz sorusu olabilecek bilgileri özetle.")
				.call()
				.content();
			
			System.out.println("Document content length: " + documentContent.length());
			System.out.println("First 300 chars: " + documentContent.substring(0, Math.min(300, documentContent.length())));
			
			// Eğer doküman içeriği bulunamadıysa
			if (documentContent.length() < 100 ||
				documentContent.contains("Bu sorunun cevabı") ||
				documentContent.contains("I don't know") ||
				documentContent.toLowerCase().contains("bulunmuyor")) {
				
				System.out.println("ERROR: No valid document content found");
				return ResponseEntity.ok("{\"error\": \"Doküman içeriği bulunamadı. Lütfen önce bir doküman yükleyin.\"}");
			}
			
			// PHASE 2: Quiz generation with specialized quiz client
			System.out.println("Phase 2: Generating quiz with quizChatClient...");
			
			// Token optimizasyonu için content'i kısalt
			String truncatedContent = documentContent.length() > 1500 ?
				documentContent.substring(0, 1500) + "..." : documentContent;
			
			String optimizedQuizPrompt = String.format("""
				Aşağıdaki doküman içeriğinden %d adet %s seviyesinde çoktan seçmeli sorular oluştur.
				
				DOKÜMAN İÇERİĞİ:
				%s
				
				KALİTE KURALLARI:
				1. Sorular dokümandaki SPESİFİK bilgileri test etmeli
				2. Her soru detaylı ve açıklayıcı olmalı
				3. Doğru cevap kesinlikle dokümanda geçmeli
				4. Yanlış şıklar mantıklı yanıltmaca olmalı
				5. JSON formatında döndür
				
				SORU ÖRNEĞİ:
				{
				  "question": "Dokümanda bahsedilen kavramla ilgili detaylı soru?",
				  "options": {
				    "A": "Doğru seçenek",
				    "B": "Yanlış ama mantıklı seçenek",
				    "C": "Başka yanlış seçenek",
				    "D": "Son yanlış seçenek"
				  },
				  "answer": "A"
				}
				
				%d soru oluştur. Sadece JSON döndür.
				""", questionCount, difficulty, truncatedContent, questionCount);
			
			// Quiz client ile structured output
			QuizResponse quizResponse = quizChatClient.prompt()
				.user(optimizedQuizPrompt)
				.call()
				.entity(QuizResponse.class);
			
			if (quizResponse.questions() != null && !quizResponse.questions().isEmpty()) {
				System.out.println("Quiz generated successfully with " + quizResponse.questions().size() + " questions");
				String jsonResponse = objectMapper.writeValueAsString(quizResponse);
				return ResponseEntity.ok(jsonResponse);
			} else {
				System.out.println("Empty quiz response, trying fallback...");
				return generateFallbackQuiz(username, questionCount, difficulty, truncatedContent);
			}
			
		} catch (Exception e) {
			System.err.println("=== QUIZ GENERATION ERROR ===");
			System.err.println("Error type: " + e.getClass().getSimpleName());
			System.err.println("Error message: " + e.getMessage());
			e.printStackTrace();
			
			// Fallback approach
			return generateEmergencyFallbackQuiz(username, questionCount);
		} finally {
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
	
	/**
	 * Fallback with specialized fallback client
	 */
	private ResponseEntity<String> generateFallbackQuiz(String username, int questionCount, String difficulty, String content) {
		try {
			System.out.println("=== FALLBACK QUIZ GENERATION with quizFallbackChatClient ===");
			UserDocumentRetriever.setCurrentUsername(username);
			
			// Very simple prompt for fallback client
			String fallbackPrompt = String.format("""
				Create %d simple quiz questions from this content:
				%s
				
				JSON format:
				{"questions":[{"question":"Question?","options":{"A":"Option1","B":"Option2","C":"Option3","D":"Option4"},"answer":"A"}]}
				
				Return only JSON.
				""", questionCount,
				content.length() > 800 ? content.substring(0, 800) : content);
			
			String rawResponse = quizFallbackChatClient.prompt()
				.user(fallbackPrompt)
				.call()
				.content();
			
			// Extract and validate JSON
			String jsonPart = extractJsonFromResponse(rawResponse);
			QuizResponse testParse = objectMapper.readValue(jsonPart, QuizResponse.class);
			
			System.out.println("Fallback quiz generated successfully");
			return ResponseEntity.ok(objectMapper.writeValueAsString(testParse));
			
		} catch (Exception fallbackEx) {
			System.err.println("Fallback approach failed: " + fallbackEx.getMessage());
			return generateEmergencyFallbackQuiz(username, questionCount);
		} finally {
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
	
	/**
	 * Emergency fallback - hardcoded quiz when everything fails
	 */
	private ResponseEntity<String> generateEmergencyFallbackQuiz(String username, int questionCount) {
		System.out.println("=== EMERGENCY FALLBACK QUIZ ===");
		
		StringBuilder questions = new StringBuilder();
		for (int i = 1; i <= Math.min(questionCount, 3); i++) {
			if (i > 1) questions.append(",");
			questions.append(String.format("""
				{
				  "question": "Doküman hakkında genel soru %d (Teknik sorun nedeniyle)",
				  "options": {
				    "A": "Bu dokümandaki önemli bir bilgi",
				    "B": "Bu dokümandaki başka bir bilgi",
				    "C": "Bu dokümandaki farklı bir bilgi",
				    "D": "Bu dokümandaki ek bilgi"
				  },
				  "answer": "A"
				}
				""", i));
		}
		
		String emergencyQuiz = String.format("""
			{
			  "questions": [%s],
			  "note": "Teknik sorun nedeniyle basit quiz oluşturuldu. Chat geçmişini temizleyip tekrar deneyin."
			}
			""", questions.toString());
		
		return ResponseEntity.ok(emergencyQuiz);
	}
	
	/**
	 * Extract JSON from response string
	 */
	private String extractJsonFromResponse(String response) {
		if (response == null) return "{}";
		
		int start = response.indexOf("{");
		int end = response.lastIndexOf("}");
		
		if (start != -1 && end != -1 && end > start) {
			return response.substring(start, end + 1);
		}
		
		return "{}";
	}
	
	// Diğer endpoint'ler
	@PostMapping("/generate-rag")
	public ResponseEntity<String> generateQuizWithRAG(@RequestBody Map<String, Object> request) {
		return generateStructuredQuiz(request);
	}
	
	@PostMapping("/generate")
	public ResponseEntity<String> generateQuiz(@RequestBody Map<String, Object> request) {
		return generateStructuredQuiz(request);
	}
}