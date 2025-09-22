package com.burak.openai.controller;

import com.burak.openai.rag.UserDocumentRetriever;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {
	
	private final ChatClient chatClient;
	
	public QuizController(@Qualifier("userDocumentChatClient") ChatClient chatClient) {
		this.chatClient = chatClient;
	}
	
	@PostMapping("/generate")
	public ResponseEntity<String> generateQuiz(@RequestBody Map<String, Object> request) {
		String username = (String) request.getOrDefault("username", "burak");
		Integer questionCount = (Integer) request.getOrDefault("questionCount", 5);
		String difficulty = (String) request.getOrDefault("difficulty", "orta");
		
		try {
			// Set current username for retriever
			UserDocumentRetriever.setCurrentUsername(username);
			
			String quizPrompt = String.format(
				"Yüklenen dokümandan %d adet %s seviyesinde çoktan seçmeli soru oluştur. " +
					"Her soru için 4 şık olsun (A, B, C, D). " +
					"Sorular dokümanın içeriğini kapsamalı ve anlamlı olmalı. " +
					"Sadece aşağıdaki JSON formatında döndür, başka hiçbir metin ekleme:\n\n" +
					"{\n" +
					"  \"questions\": [\n" +
					"    {\n" +
					"      \"question\": \"Soru metni\",\n" +
					"      \"options\": [\"A) Şık 1\", \"B) Şık 2\", \"C) Şık 3\", \"D) Şık 4\"],\n" +
					"      \"correctAnswer\": 0,\n" +
					"      \"explanation\": \"Doğru cevabın açıklaması\"\n" +
					"    }\n" +
					"  ]\n" +
					"}",
				questionCount, difficulty
			);
			
			String response = chatClient.prompt()
				.user(quizPrompt)
				.call()
				.content();
			
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
				.body("Quiz oluşturulurken hata oluştu: " + e.getMessage());
		} finally {
			// Clear username
			UserDocumentRetriever.clearCurrentUsername();
		}
	}
	
	
		// YENİ ALTERNATIF METHOD - RAG-based approach
		@PostMapping("/generate-rag")
		public ResponseEntity<String> generateQuizWithRAG(@RequestBody Map<String, Object> request) {
			String username = (String) request.getOrDefault("username", "burak");
			Integer questionCount = (Integer) request.getOrDefault("questionCount", 5);
			String difficulty = (String) request.getOrDefault("difficulty", "orta");
			
			try {
				// Set current username for retriever
				UserDocumentRetriever.setCurrentUsername(username);
				
				String quizPrompt = String.format(
					"Yüklediğim doküman hakkında %d adet %s seviyesinde çoktan seçmeli soru oluştur. " +
						"Her soru için 4 şık ver (A, B, C, D) ve doğru cevabı belirt. " +
						"Sorular dokümanın gerçek içeriğinden olmalı. " +
						"Şıklar mantıklı ve yanıltıcı olmalı. " +
						"Sadece JSON formatında döndür: " +
						"{\n" +
						"  \"questions\": [\n" +
						"    {\n" +
						"      \"question\": \"Soru metni\",\n" +
						"      \"options\": [\"A) Şık 1\", \"B) Şık 2\", \"C) Şık 3\", \"D) Şık 4\"],\n" +
						"      \"correctAnswer\": 0,\n" +
						"      \"explanation\": \"Açıklama\"\n" +
						"    }\n" +
						"  ]\n" +
						"}",
					questionCount, difficulty
				);
				
				String response = chatClient.prompt()
					.user(quizPrompt)
					.call()
					.content();
				
				return ResponseEntity.ok(response);
			} catch (Exception e) {
				System.err.println("Quiz generation error: " + e.getMessage());
				return ResponseEntity.internalServerError()
					.body("Quiz oluşturulurken hata oluştu: " + e.getMessage());
			} finally {
				// Clear username
				UserDocumentRetriever.clearCurrentUsername();
			}
		}
	}
	
	
